import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'draft', 'published', または null (全て)
    const yearMonth = searchParams.get('year_month');

    const supabase = createClient();
    
    let query = supabase
      .from('owner_messages')
      .select('*')
      .order('year_month', { ascending: false });

    // ステータスフィルター
    if (status && (status === 'draft' || status === 'published')) {
      query = query.eq('status', status);
    }

    // 年月フィルター
    if (yearMonth) {
      query = query.eq('year_month', yearMonth);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('オーナーメッセージ取得エラー:', error);
      return NextResponse.json(
        { error: 'オーナーメッセージの取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: messages || []
    });

  } catch (error) {
    console.error('オーナーメッセージ一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'オーナーメッセージの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'メッセージIDが必要です' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // メッセージを削除
    const { error: deleteError } = await supabase
      .from('owner_messages')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('削除エラー:', deleteError);
      return NextResponse.json(
        { error: 'メッセージの削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'オーナーメッセージが削除されました'
    });

  } catch (error) {
    console.error('オーナーメッセージ削除エラー:', error);
    return NextResponse.json(
      { error: 'オーナーメッセージの削除に失敗しました' },
      { status: 500 }
    );
  }
}