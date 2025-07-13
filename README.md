# Multi-Brand AI Readiness Assessment Tool

A white-label assessment tool for Level AI, Tech4Good South West, and RAISE Foundation. Built with Next.js 14, Tailwind CSS, and Supabase.

## Features

- 🎨 **Multi-brand theming** - Single codebase, three distinct brands
- 📊 **Smart scoring algorithm** - Weighted questions across four key areas
- 💾 **Progress saving** - Users can resume assessments later
- 📧 **Lead generation** - Integrated with HubSpot via n8n
- 📱 **Fully responsive** - Works beautifully on all devices
- 🔒 **Privacy-first** - GDPR compliant data handling

## Themes

Access different brands using URL parameters:
- **Level AI**: `?theme=levelai` (default)
- **Tech4Good SW**: `?theme=tech4good`
- **RAISE Foundation**: `?theme=raise`

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/simonlevelai/readiness.wearelevel.ai-v2.git
   cd readiness.wearelevel.ai-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env.local` and add your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_N8N_WEBHOOK_URL=your_n8n_webhook_url
   ```

4. **Set up Supabase table**
   Run this SQL in your Supabase dashboard:
   ```sql
   CREATE TABLE IF NOT EXISTS assessments (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     session_id TEXT NOT NULL,
     theme TEXT NOT NULL,
     email TEXT NOT NULL,
     name TEXT,
     organisation TEXT,
     role TEXT,
     answers JSONB,
     scores JSONB,
     interpretation TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

5. **Run locally**
   ```bash
   npm run dev
   ```

6. **Deploy to Vercel**
   ```bash
   vercel
   ```

## Project Structure

```
├── app/
│   ├── components/
│   │   └── AssessmentTool.js    # Main assessment component
│   ├── layout.js                # Root layout
│   ├── page.js                  # Home page
│   └── globals.css              # Global styles
├── public/                      # Static assets
├── .env.local                   # Environment variables (not in git)
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Customisation

### Adding a new theme
1. Add theme configuration to `THEMES` object in `AssessmentTool.js`
2. Include colors, messaging, and section customisation
3. Access via `?theme=yourtheme`

### Modifying questions
Questions are defined in the `sections` array. Each question has:
- `type`: 'single' or 'multiple' choice
- `weight`: Importance multiplier (default 1)
- `options`: Array of choices with scores (0-4)

### Styling
- Uses Tailwind CSS for utility-first styling
- Theme colors are applied dynamically
- Modify `theme.colors` for brand-specific palettes

## Integration

### HubSpot
The tool sends assessment data to HubSpot via n8n webhook:
- Creates/updates contacts
- Sets custom properties per theme
- Triggers automation workflows

### Supabase
Stores complete assessment data:
- Session tracking
- Full response data
- Scoring breakdowns
- Timestamp tracking

## Deployment

### Vercel (Recommended)
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Custom domains
Map domains to themes:
- `readiness.wearelevel.ai` → Level AI theme
- `readiness.tech4good.org.uk` → Tech4Good theme
- `readiness.raisefoundation.org` → RAISE theme

## Support

For issues or questions:
- Create a GitHub issue
- Contact simon@wearelevel.ai

## License

Private repository - all rights reserved.