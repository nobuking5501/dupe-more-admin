import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'メッセージIDが必要です' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // メッセージが存在するかチェック
    const { data: message, error: messageError } = await supabase
      .from('owner_messages')
      .select('*')
      .eq('id', id)
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { error: 'メッセージが見つかりません' },
        { status: 404 }
      );
    }

    // 同じ月に既に公開済みのメッセージがあるかチェック
    const { data: existingPublished } = await supabase
      .from('owner_messages')
      .select('id')
      .eq('year_month', message.year_month)
      .eq('status', 'published')
      .neq('id', id);

    if (existingPublished && existingPublished.length > 0) {
      return NextResponse.json(
        { error: 'この月には既に公開済みのメッセージがあります' },
        { status: 409 }
      );
    }

    // メッセージを公開状態に更新
    const { data: publishedMessage, error: publishError } = await supabase
      .from('owner_messages')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (publishError) {
      console.error('公開エラー:', publishError);
      return NextResponse.json(
        { error: 'メッセージの公開に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'オーナーメッセージが公開されました',
      data: publishedMessage
    });

  } catch (error) {
    console.error('オーナーメッセージ公開エラー:', error);
    return NextResponse.json(
      { error: 'オーナーメッセージの公開に失敗しました' },
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
    
    // メッセージを非公開（ドラフト）に戻す
    const { data: unpublishedMessage, error: unpublishError } = await supabase
      .from('owner_messages')
      .update({
        status: 'draft',
        published_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (unpublishError) {
      console.error('非公開エラー:', unpublishError);
      return NextResponse.json(
        { error: 'メッセージの非公開化に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'オーナーメッセージが非公開になりました',
      data: unpublishedMessage
    });

  } catch (error) {
    console.error('オーナーメッセージ非公開エラー:', error);
    return NextResponse.json(
      { error: 'オーナーメッセージの非公開化に失敗しました' },
      { status: 500 }
    );
  }
}