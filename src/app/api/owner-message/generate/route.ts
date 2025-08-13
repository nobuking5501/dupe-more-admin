import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import { ClaudeClient } from '@/lib/claude-client';
import { log } from '@/lib/logger';

interface DailyReport {
  id: string;
  content: string;
  date: string;
  staff_name: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    log.api.request('/api/owner-message/generate', 'POST');
    
    const { yearMonth } = await request.json();
    log.info('OWNER_MESSAGE', 'Generation request received', { yearMonth });
    
    if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) {
      log.warn('OWNER_MESSAGE', 'Invalid yearMonth format', { yearMonth });
      return NextResponse.json(
        { error: '年月の形式が正しくありません (YYYY-MM)' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // その月の日報データを取得
    const startDate = `${yearMonth}-01`;
    const endDate = `${yearMonth}-31`;
    
    log.supabase.query('daily_reports', 'SELECT', { startDate, endDate });
    const { data: reports, error: reportsError } = await supabase
      .from('daily_reports')
      .select(`
        id,
        content,
        date,
        staff:staff_id (name)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (reportsError) {
      log.supabase.error('daily_reports', 'SELECT', reportsError);
      log.api.response('/api/owner-message/generate', 500, { error: reportsError });
      return NextResponse.json(
        { error: '日報データの取得に失敗しました' },
        { status: 500 }
      );
    }

    if (!reports || reports.length === 0) {
      log.warn('OWNER_MESSAGE', 'No reports found for month', { yearMonth, reportCount: 0 });
      log.api.response('/api/owner-message/generate', 404);
      return NextResponse.json(
        { error: '指定された月の日報が見つかりません' },
        { status: 404 }
      );
    }

    log.info('OWNER_MESSAGE', 'Reports retrieved successfully', { 
      yearMonth, 
      reportCount: reports.length 
    });

    // Claude APIを使用してメッセージを生成
    const claudeClient = new ClaudeClient();
    const generatedMessage = await generateOwnerMessage(claudeClient, reports, yearMonth);

    // 既存のドラフトをチェック
    const { data: existingDraft } = await supabase
      .from('owner_messages')
      .select('id')
      .eq('year_month', yearMonth)
      .eq('status', 'draft')
      .single();

    const messageData = {
      year_month: yearMonth,
      title: generatedMessage.title,
      body_md: generatedMessage.body_md,
      highlights: generatedMessage.highlights,
      sources: reports.map((r: any) => r.id),
      status: 'draft' as const,
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingDraft) {
      // 既存のドラフトを更新
      const { data, error } = await supabase
        .from('owner_messages')
        .update(messageData)
        .eq('id', existingDraft.id)
        .select()
        .single();
      
      result = { data, error };
    } else {
      // 新しいドラフトを作成
      const { data, error } = await supabase
        .from('owner_messages')
        .insert([messageData])
        .select()
        .single();
      
      result = { data, error };
    }

    if (result.error) {
      console.error('オーナーメッセージ保存エラー:', result.error);
      return NextResponse.json(
        { error: 'オーナーメッセージの保存に失敗しました' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    log.info('OWNER_MESSAGE', 'Message generation completed successfully', { 
      yearMonth, 
      duration: `${duration}ms`,
      messageId: result.data?.id 
    });
    log.api.response('/api/owner-message/generate', 200, { messageId: result.data?.id });

    return NextResponse.json({
      message: 'オーナーメッセージが生成されました',
      data: result.data
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    log.error('OWNER_MESSAGE', 'Message generation failed', { 
      yearMonth: request.body, 
      duration: `${duration}ms`,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    });
    log.api.response('/api/owner-message/generate', 500, { error });

    return NextResponse.json(
      { error: 'オーナーメッセージの生成に失敗しました' },
      { status: 500 }
    );
  }
}

async function generateOwnerMessage(claudeClient: ClaudeClient, reports: DailyReport[], yearMonth: string) {
  const [year, month] = yearMonth.split('-');
  const monthName = `${parseInt(month)}月`;
  
  // 日報内容を要約用に整理
  const reportSummaries = reports.map(report => ({
    date: report.date,
    content: report.content,
    staff: report.staff_name
  }));

  const prompt = `
あなたはサロンオーナーの広報ライターです。以下の月次日報データから、お客様向けのオーナーメッセージを生成してください。

【条件】
- 役割: サロンオーナーの広報ライター
- 目的: 日報から月次メッセージ(400〜600字程度)を作る
- トーン: 安心・謙虚・伴走・透明性
- 構成:
  1) ご挨拶（50〜80字）
  2) 今月の学び(要約3〜4件を再編集。具体は一般化)
  3) 初めての方向けのひとこと（不安の言語化→安心の提示）
- 禁止: 個人特定/医療断定/他店比較

【${monthName}の日報データ】
${reportSummaries.map(r => `${r.date}: ${r.content}`).join('\n')}

【出力形式】
JSONで以下の形式で出力してください：
{
  "title": "${monthName}のオーナーメッセージ",
  "body_md": "Markdown形式の本文（400～600字）",
  "highlights": ["見出し1","見出し2"],
  "sources": []
}

重要：JSONのみを出力し、他の文言は含めないでください。
`;

  try {
    log.claude.request(prompt);
    const response = await claudeClient.generateText(prompt);
    log.claude.response(response);
    
    const parsedResponse = JSON.parse(response);
    
    log.info('OWNER_MESSAGE', 'Claude response parsed successfully', {
      titleLength: parsedResponse.title?.length || 0,
      bodyLength: parsedResponse.body_md?.length || 0,
      highlightCount: parsedResponse.highlights?.length || 0
    });
    
    return {
      title: parsedResponse.title || `${monthName}のオーナーメッセージ`,
      body_md: parsedResponse.body_md || '',
      highlights: parsedResponse.highlights || [],
      sources: [] // reportsのIDは後で設定
    };
  } catch (error) {
    log.claude.error(error);
    
    // フォールバック: 基本的なメッセージを生成
    return {
      title: `${monthName}のオーナーメッセージ`,
      body_md: `## ${monthName}のご挨拶\n\nいつもご来店いただき、ありがとうございます。\n\n## 今月の学び\n\n今月も多くのお客様にお越しいただき、様々な学びがありました。お一人お一人のご要望に寄り添い、より良いサービスを提供できるよう努めております。\n\n## 初めてのお客様へ\n\n初回のご来店は不安もあるかと思いますが、お客様のペースに合わせて丁寧にご対応いたします。どんな小さなことでもお気軽にご相談ください。`,
      highlights: ['今月のご挨拶', '今月の学び', '初めてのお客様へ'],
      sources: []
    };
  }
}