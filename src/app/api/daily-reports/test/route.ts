import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  try {
    // まずはテーブル存在確認
    console.log('Testing Supabase connection and daily_reports table...');
    
    const { data: tables, error: tableError } = await SupabaseService.supabase
      .from('daily_reports')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('テーブル確認エラー:', tableError);
      return NextResponse.json({
        error: 'テーブル確認エラー',
        details: tableError
      }, { status: 500 });
    }

    console.log('Daily reports table test result:', { 
      success: true, 
      hasData: !!tables && tables.length > 0 
    });

    // 日報データの取得テスト
    const { data: reports, error: reportsError } = await SupabaseService.supabase
      .from('daily_reports')
      .select(`
        id,
        content,
        date,
        staff_id,
        created_at
      `)
      .order('date', { ascending: false })
      .limit(10);

    if (reportsError) {
      console.error('日報取得エラー:', reportsError);
      return NextResponse.json({
        error: '日報取得エラー',
        details: reportsError
      }, { status: 500 });
    }

    // スタッフ情報も一緒に取得
    const { data: staff, error: staffError } = await SupabaseService.supabase
      .from('staff')
      .select('id, name, email');

    if (staffError) {
      console.error('スタッフ取得エラー:', staffError);
    }

    return NextResponse.json({
      message: 'Supabase接続テスト成功',
      data: {
        reports: reports || [],
        staff: staff || [],
        reportCount: reports?.length || 0,
        staffCount: staff?.length || 0
      }
    });

  } catch (error) {
    console.error('テストエラー:', error);
    return NextResponse.json({
      error: 'テスト実行エラー',
      details: error
    }, { status: 500 });
  }
}