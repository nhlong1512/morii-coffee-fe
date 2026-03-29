# Debug OAuth redirect_uri Mismatch

## The Problem

Google is rejecting your OAuth request with:
```
Error 400: redirect_uri_mismatch
```

This means the `redirect_uri` your backend is sending to Google doesn't match what's registered in Google Cloud Console.

## Step 1: Find Out What redirect_uri Your Backend is Sending

### Method 1: Browser Network Tab (Recommended)

1. Open your browser DevTools (F12)
2. Go to **Network** tab
3. Check "Preserve log"
4. Click "Sign in with Google" button
5. Look for the redirect to Google (URL starts with `https://accounts.google.com/o/oauth2/v2/auth`)
6. Copy that URL
7. Look for the `redirect_uri` parameter in the URL

**Example URL:**
```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=123456789.apps.googleusercontent.com
  &redirect_uri=http://localhost:8002/signin-google  ← THIS IS THE PROBLEM!
  &response_type=code
  &scope=openid%20profile%20email
  &state=...
```

**Copy the entire `redirect_uri` value** - this is what you need to add to Google Cloud Console.

### Method 2: Check Backend Configuration

The redirect URI depends on your ASP.NET Core Google OAuth configuration.

**Find your OAuth configuration** (usually in `Program.cs` or `Startup.cs`):

```csharp
services.AddAuthentication()
    .AddGoogle(options =>
    {
        options.ClientId = Configuration["Authentication:Google:ClientId"];
        options.ClientSecret = Configuration["Authentication:Google:ClientSecret"];
        options.CallbackPath = "/signin-google";  // ← THIS IS THE CALLBACK PATH!
    });
```

The actual redirect URI will be:
```
{scheme}://{host}{CallbackPath}
```

For example:
- If `CallbackPath = "/signin-google"`
- And your backend is at `http://localhost:8002`
- Then redirect URI = `http://localhost:8002/signin-google`

**Common CallbackPath values:**
- `/signin-google` (ASP.NET Core default)
- `/api/v1/auth/external-auth-callback` (your custom path)
- `/auth/callback/google` (another common pattern)

## Step 2: Add the CORRECT Redirect URI to Google Cloud Console

Once you know the exact redirect URI from Step 1:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, click **+ ADD URI**
6. Paste the EXACT redirect URI you found in Step 1
7. Click **Save**

**⚠️ Important:**
- Match EXACTLY (including http/https, port, path, no trailing slash)
- Wait 1-2 minutes after saving for Google to propagate changes
- If you have both `http://localhost:8002/signin-google` AND `http://localhost:8002/api/v1/auth/external-auth-callback`, add BOTH

## Step 3: Verify Your Backend OAuth Configuration

Check your backend configuration files:

### Option A: If Using Default ASP.NET Core Path

**Your backend should redirect Google to the CallbackPath:**

```csharp
// Program.cs or Startup.cs
services.AddAuthentication()
    .AddGoogle(googleOptions =>
    {
        googleOptions.ClientId = Configuration["Authentication:Google:ClientId"];
        googleOptions.ClientSecret = Configuration["Authentication:Google:ClientSecret"];
        googleOptions.CallbackPath = "/signin-google";  // Default ASP.NET Core path

        // After Google redirects here, you need to handle it
        googleOptions.Events = new OAuthEvents
        {
            OnCreatingTicket = async context =>
            {
                // Handle user creation/login here
                // Then redirect to your custom callback endpoint
            }
        };
    });
```

**Add to Google Cloud Console:**
```
http://localhost:8002/signin-google
```

### Option B: If Using Custom Callback Path (Recommended for Your Setup)

Since your controller has `[HttpGet("external-auth-callback")]`, you should configure:

```csharp
services.AddAuthentication()
    .AddGoogle(googleOptions =>
    {
        googleOptions.ClientId = Configuration["Authentication:Google:ClientId"];
        googleOptions.ClientSecret = Configuration["Authentication:Google:ClientSecret"];

        // Set custom callback path to match your controller endpoint
        googleOptions.CallbackPath = "/api/v1/auth/external-auth-callback";

        // Optional: Explicitly set the redirect URI
        // googleOptions.SignInScheme = IdentityConstants.ExternalScheme;
    });
```

**Add to Google Cloud Console:**
```
http://localhost:8002/api/v1/auth/external-auth-callback
```

## Step 4: Common Mistakes and Fixes

### ❌ Mistake 1: Wrong Host/Port

**Google says:** `redirect_uri_mismatch`

**Check:**
- Is your backend running on `http://localhost:8002`?
- Or is it on `http://localhost:5000` or `https://localhost:5001`?

**Fix:** Use the actual host/port where your backend is running.

### ❌ Mistake 2: Trailing Slash

**Google says:** `redirect_uri_mismatch`

**Check:**
```
Registered: http://localhost:8002/signin-google/
Actual:     http://localhost:8002/signin-google
```

**Fix:** Remove trailing slash or add it consistently.

### ❌ Mistake 3: HTTP vs HTTPS

**Google says:** `redirect_uri_mismatch`

**Check:**
```
Registered: https://localhost:8002/signin-google
Actual:     http://localhost:8002/signin-google
```

**Fix:** Match the protocol exactly.

### ❌ Mistake 4: Path Mismatch

**Google says:** `redirect_uri_mismatch`

**Check:**
```
Registered: http://localhost:8002/api/v1/auth/external-auth-callback
Actual:     http://localhost:8002/signin-google
```

**Fix:** Your `CallbackPath` configuration doesn't match what's registered.

## Step 5: Quick Test Script

Create a test to see what your backend is configured with:

**Create:** `test-oauth-config.sh`

```bash
#!/bin/bash

# Test OAuth configuration
echo "Testing Google OAuth configuration..."
echo ""

# Make a POST request to your external-login endpoint
# This should return a 302 redirect to Google
response=$(curl -i -X POST "http://localhost:8002/api/v1/auth/external-login?provider=Google" 2>&1)

# Extract the Location header (redirect to Google)
location=$(echo "$response" | grep -i "^Location:" | cut -d' ' -f2)

echo "Backend redirects to:"
echo "$location"
echo ""

# Extract redirect_uri from the Google URL
if [[ $location == *"redirect_uri="* ]]; then
    redirect_uri=$(echo "$location" | grep -oP 'redirect_uri=\K[^&]+')
    decoded_uri=$(echo "$redirect_uri" | python3 -c "import sys, urllib.parse as ul; print(ul.unquote_plus(sys.stdin.read()))")

    echo "Redirect URI being sent to Google:"
    echo "$decoded_uri"
    echo ""
    echo "👉 Add this EXACT URL to Google Cloud Console!"
else
    echo "❌ No redirect_uri found in response"
    echo "Full response:"
    echo "$response"
fi
```

**Run:**
```bash
chmod +x test-oauth-config.sh
./test-oauth-config.sh
```

This will show you the EXACT redirect URI your backend is sending.

## Step 6: Complete Backend Configuration Example

Here's a complete example that should work:

**Program.cs or Startup.cs:**

```csharp
// Add authentication services
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = IdentityConstants.ApplicationScheme;
    options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
})
.AddGoogle(googleOptions =>
{
    googleOptions.ClientId = builder.Configuration["Authentication:Google:ClientId"]
        ?? throw new InvalidOperationException("Google ClientId not configured");
    googleOptions.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]
        ?? throw new InvalidOperationException("Google ClientSecret not configured");

    // IMPORTANT: Set callback path to match your controller endpoint
    googleOptions.CallbackPath = "/api/v1/auth/external-auth-callback";

    // Request additional scopes
    googleOptions.Scope.Add("profile");
    googleOptions.Scope.Add("email");

    // Save tokens for later use
    googleOptions.SaveTokens = true;
});
```

**appsettings.Development.json:**

```json
{
  "Authentication": {
    "Google": {
      "ClientId": "123456789-abcdefg.apps.googleusercontent.com",
      "ClientSecret": "GOCSPX-your-client-secret-here"
    }
  }
}
```

**Google Cloud Console - Authorized redirect URIs:**

```
http://localhost:8002/api/v1/auth/external-auth-callback
```

## Step 7: Verification Checklist

After making changes:

- [ ] Backend configuration has correct `CallbackPath`
- [ ] Google Cloud Console has the EXACT redirect URI
- [ ] No trailing slashes anywhere
- [ ] HTTP/HTTPS matches
- [ ] Port matches
- [ ] Path matches exactly
- [ ] Waited 1-2 minutes after saving Google Cloud Console changes
- [ ] Cleared browser cache / used incognito mode
- [ ] Backend is actually running and accessible

## Still Not Working?

If you're still getting the error after following all steps:

1. **Share the following information:**
   - The exact redirect_uri from Step 1 (browser network tab)
   - Your CallbackPath configuration from backend
   - What you added to Google Cloud Console
   - Screenshot of Google Cloud Console Authorized redirect URIs section

2. **Common last resort fixes:**
   - Delete and recreate the OAuth Client ID in Google Cloud Console
   - Make sure you're editing the correct project in Google Cloud Console
   - Verify your backend is actually running on the port you think it is
   - Check for any reverse proxies or load balancers changing the URL

3. **Test with curl:**
   ```bash
   curl -i -X POST "http://localhost:8002/api/v1/auth/external-login?provider=Google"
   ```
   This will show you the exact redirect Google receives.
