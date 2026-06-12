import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '../../../../../emails/utils/send';
import Welcome from '../../../../../emails/templates/auth/Welcome';

const templateMap: Record<string, (props: Record<string, unknown>) => React.ReactElement> = {
  Welcome: (props) => <Welcome {...(props as Record<string, string>)} />,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, to, subject, props } = body;

    if (!template || !to || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: template, to, subject' },
        { status: 400 }
      );
    }

    const componentFn = templateMap[template];

    if (!componentFn) {
      return NextResponse.json(
        { error: `Unknown template: ${template}` },
        { status: 400 }
      );
    }

    const react = componentFn(props || {});

    const result = await sendEmail({
      to,
      subject,
      react,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
