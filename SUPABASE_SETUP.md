# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - Name: `marketing-hub`
   - Database Password: (choose a strong password)
   - Region: Choose closest to your users
6. Click "Create new project"
7. Wait for the project to be ready (usually 1-2 minutes)

## 2. Get Your Credentials

1. Go to your project dashboard
2. Navigate to **Settings > API**
3. Copy the following values:
   - **Project URL** (this is your `VITE_SUPABASE_URL`)
   - **anon/public** key (this is your `VITE_SUPABASE_ANON_KEY`)

## 3. Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Set Up the Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click "New Query"
4. Copy the contents of `supabase-setup.sql` from this project
5. Paste it into the SQL Editor
6. Click "Run" to execute the SQL

This will create:
- A `users` table with the necessary columns
- Row Level Security policies
- Indexes for performance

## 5. Configure Authentication Settings

1. Go to **Authentication > Settings**
2. Under "Site URL", add your local development URL: `http://localhost:8080`
3. Under "Redirect URLs", add: `http://localhost:8080/**`
4. Make sure "Enable email confirmations" is **disabled** for development (you can enable it later for production)

## 6. Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:8080/register`
3. Try to register a new user
4. Check your Supabase dashboard under **Authentication > Users** to see if the user was created
5. Check **Table Editor > users** to see if the user record was created

## 7. Troubleshooting

### "Missing Supabase environment variables"
- Make sure your `.env` file exists and contains the correct values
- Restart your development server after updating `.env`

### "Email already registered"
- Check if the user already exists in Supabase Authentication
- You can delete test users in the Supabase dashboard under Authentication > Users

### "Usuario no encontrado en el sistema"
- This means the user exists in Supabase Auth but not in the `users` table
- Check the Table Editor to see if the user record was created
- Check the SQL execution logs for any errors

### Connection issues
- Verify your Supabase project URL and anon key are correct
- Check that your Supabase project is active (not paused)
- Ensure you have internet connectivity

## 8. Production Deployment

When deploying to production:

1. Add your production Supabase credentials to your hosting platform's environment variables
2. Update the Site URL and Redirect URLs in Supabase Authentication settings to your production domain
3. Consider enabling email confirmations for production
4. Review and adjust Row Level Security policies based on your security requirements
5. Use the Supabase service role key (not anon key) for server-side operations if needed

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase TypeScript Guide](https://supabase.com/docs/guides/database/typescript)
