import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { 
      email, 
      name, 
      organisation, 
      theme, 
      scores, 
      interpretation,
      pdfData 
    } = await request.json();

    const emailProvider = process.env.EMAIL_PROVIDER || 'mailerlite';
    
    // Send email based on provider
    if (emailProvider === 'mailerlite') {
      await sendMailerLiteEmail({
        email,
        name,
        organisation,
        theme,
        scores,
        interpretation,
        pdfData
      });
    } else if (emailProvider === 'mailersend') {
      await sendMailerSendEmail({
        email,
        name,
        organisation,
        theme,
        scores,
        interpretation,
        pdfData
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

async function sendMailerLiteEmail({ email, name, organisation, theme, scores, interpretation, pdfData }) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  
  if (!apiKey) {
    throw new Error('MailerLite API key not configured');
  }

  // Get template ID based on theme
  const templateId = getTemplateId(theme);
  
  const emailData = {
    to: [{ email, name }],
    from: {
      email: 'reports@wearelevel.ai',
      name: 'Level AI Reports'
    },
    template_id: templateId,
    variables: {
      name,
      organisation,
      overall_score: scores.overall,
      interpretation_level: interpretation.level,
      interpretation_message: interpretation.message,
      current_date: new Date().toLocaleDateString()
    },
    attachments: pdfData ? [{
      filename: `${name.replace(/\s+/g, '-')}-AI-Readiness-Roadmap.pdf`,
      content: pdfData,
      type: 'application/pdf'
    }] : []
  };

  const response = await fetch('https://connect.mailerlite.com/api/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`MailerLite API error: ${errorData}`);
  }

  return response.json();
}

async function sendMailerSendEmail({ email, name, organisation, theme, scores, interpretation, pdfData }) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  
  if (!apiKey) {
    throw new Error('MailerSend API key not configured');
  }

  const templateId = getTemplateId(theme);
  
  const emailData = {
    from: {
      email: 'reports@wearelevel.ai',
      name: 'Level AI Reports'
    },
    to: [{ email, name }],
    template_id: templateId,
    variables: [
      {
        email,
        substitutions: [
          { var: 'name', value: name },
          { var: 'organisation', value: organisation },
          { var: 'overall_score', value: scores.overall.toString() },
          { var: 'interpretation_level', value: interpretation.level },
          { var: 'interpretation_message', value: interpretation.message },
          { var: 'current_date', value: new Date().toLocaleDateString() }
        ]
      }
    ],
    attachments: pdfData ? [{
      filename: `${name.replace(/\s+/g, '-')}-AI-Readiness-Roadmap.pdf`,
      content: pdfData,
      disposition: 'attachment'
    }] : []
  };

  const response = await fetch('https://api.mailersend.com/v1/email', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`MailerSend API error: ${errorData}`);
  }

  return response.json();
}

function getTemplateId(theme) {
  switch (theme) {
    case 'Level AI':
      return process.env.LEVEL_AI_TEMPLATE_ID;
    case 'Tech4Good South West':
      return process.env.TECH4GOOD_TEMPLATE_ID;
    case 'RAISE Foundation':
      return process.env.RAISE_TEMPLATE_ID;
    default:
      return process.env.LEVEL_AI_TEMPLATE_ID;
  }
}