# Backend Fixes Required for Google OAuth

## Issue Summary

The current backend implementation has several issues that prevent the OAuth flow from working correctly with the frontend.

## Required Changes

### 1. Google Cloud Console Configuration

**Add this redirect URI to your Google OAuth Client:**
```
http://localhost:5100/api/v1/auth/external-auth-callback
```

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, click **+ ADD URI**
5. Paste: `http://localhost:5100/api/v1/auth/external-auth-callback`
6. Click **Save**
7. Wait 1-2 minutes for propagation

### 2. Fix Cookie HttpOnly Flag

**File:** `MoriiCoffee.Presentation/Controllers/AuthController.cs`

**Current (Incorrect):**
```csharp
Response.Cookies.Append("AuthTokenHolder", cookieValue, new Microsoft.AspNetCore.Http.CookieOptions
{
    HttpOnly = true,  // ❌ JavaScript cannot read this!
    Secure = true,
    SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Strict,
    MaxAge = TimeSpan.FromMinutes(5),
    Path = "/"
});
```

**Fixed:**
```csharp
Response.Cookies.Append("AuthTokenHolder", cookieValue, new Microsoft.AspNetCore.Http.CookieOptions
{
    HttpOnly = false,  // ✅ Allow JavaScript to read for token extraction
    Secure = false,    // ✅ false for localhost (HTTP), true for production (HTTPS)
    SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Strict,
    MaxAge = TimeSpan.FromMinutes(5),
    Path = "/"
});
```

### 3. Include User Profile in Cookie

**File:** `MoriiCoffee.Presentation/Controllers/AuthController.cs`

**Current (Incorrect):**
```csharp
var cookieValue = System.Text.Json.JsonSerializer.Serialize(new
{
    accessToken = result.AccessToken,
    refreshToken = result.RefreshToken
    // ❌ Missing user profile!
});
```

**Fixed:**
```csharp
var cookieValue = System.Text.Json.JsonSerializer.Serialize(new
{
    accessToken = result.AccessToken,
    refreshToken = result.RefreshToken,
    user = result.User  // ✅ Include full user profile
});
```

**Note:** Ensure your `ExternalLoginCallbackCommand` result includes the `User` property with the full user profile.

### 4. Redirect to Frontend Callback Page

**File:** `MoriiCoffee.Presentation/Controllers/AuthController.cs`

**Current (Incorrect):**
```csharp
// Redirect to returnUrl (frontend will extract tokens from cookie)
return Redirect(returnUrl);
```

**Fixed:**
```csharp
// Check for OAuth errors first
if (!string.IsNullOrEmpty(error))
{
    // Redirect to frontend with error parameters
    var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000";
    return Redirect($"{frontendUrl}/auth/callback?error={error}&message={Uri.EscapeDataString(error_description ?? error)}");
}

// ... process OAuth callback ...

// Always redirect to frontend callback page (not returnUrl)
// The frontend will handle redirectTo from Zustand store
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000";
return Redirect($"{frontendUrl}/auth/callback");
```

### 5. Add Frontend URL Configuration

**File:** `appsettings.Development.json`

```json
{
  "FrontendUrl": "http://localhost:3000",
  "Authentication": {
    "Google": {
      "ClientId": "your-client-id.apps.googleusercontent.com",
      "ClientSecret": "your-client-secret"
    }
  }
}
```

**File:** `appsettings.Production.json`

```json
{
  "FrontendUrl": "https://yourdomain.com",
  "Authentication": {
    "Google": {
      "ClientId": "your-production-client-id.apps.googleusercontent.com",
      "ClientSecret": "your-production-client-secret"
    }
  }
}
```

Then update the controller to read from configuration:

```csharp
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IConfiguration _configuration;

    public AuthController(IMediator mediator, IConfiguration configuration)
    {
        _mediator = mediator;
        _configuration = configuration;
    }

    [HttpGet("external-auth-callback")]
    public async Task<IActionResult> ExternalAuthCallback(...)
    {
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";

        // Check for errors
        if (!string.IsNullOrEmpty(error))
        {
            return Redirect($"{frontendUrl}/auth/callback?error={error}&message={Uri.EscapeDataString(error_description ?? error)}");
        }

        // ... rest of the code ...

        // Redirect to frontend callback
        return Redirect($"{frontendUrl}/auth/callback");
    }
}
```

## Complete Updated ExternalAuthCallback Method

Here's the complete fixed method:

```csharp
[HttpGet("external-auth-callback")]
[SwaggerOperation(
    Summary = "OAuth callback endpoint",
    Description = "Processes Google OAuth callback. Exchanges authorization code for tokens, creates/links account, and redirects with tokens in cookie.")]
[SwaggerResponse(302, "Redirect to frontend callback with AuthTokenHolder cookie")]
[SwaggerResponse(400, SwaggerResponseMessages.BadRequest)]
[SwaggerResponse(401, SwaggerResponseMessages.Unauthorized)]
[SwaggerResponse(403, "Account inactive or deleted")]
[SwaggerResponse(500, "Token exchange or account creation failed")]
public async Task<IActionResult> ExternalAuthCallback(
    [FromQuery] string? code = null,
    [FromQuery] string? state = null,
    [FromQuery] string returnUrl = "/",
    [FromQuery] string? error = null,
    [FromQuery] string? error_description = null)
{
    var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";

    // Check for OAuth errors first (user denied, invalid request, etc.)
    if (!string.IsNullOrEmpty(error))
    {
        return Redirect($"{frontendUrl}/auth/callback?error={error}&message={Uri.EscapeDataString(error_description ?? error)}");
    }

    var command = new ExternalLoginCallbackCommand
    {
        Code = code ?? string.Empty,
        State = state ?? string.Empty,
        ReturnUrl = returnUrl,
        Error = error,
        ErrorDescription = error_description
    };

    var result = await _mediator.Send(command);

    // Store tokens AND user profile in cookie for frontend extraction
    var cookieValue = System.Text.Json.JsonSerializer.Serialize(new
    {
        accessToken = result.AccessToken,
        refreshToken = result.RefreshToken,
        user = result.User  // Must include full user profile
    });

    Response.Cookies.Append("AuthTokenHolder", cookieValue, new Microsoft.AspNetCore.Http.CookieOptions
    {
        HttpOnly = false,  // Must be false so JavaScript can read it
        Secure = false,    // false for localhost (HTTP), true for production (HTTPS)
        SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Strict,
        MaxAge = TimeSpan.FromMinutes(5),
        Path = "/"
    });

    // Always redirect to frontend callback page
    // Frontend will handle redirectTo from Zustand store
    return Redirect($"{frontendUrl}/auth/callback");
}
```

## Testing Checklist

After making these changes:

1. ✅ Verify Google Cloud Console has the correct redirect URI
2. ✅ Restart your backend application
3. ✅ Clear browser cookies
4. ✅ Try the OAuth flow again
5. ✅ Check browser DevTools → Network tab for:
   - POST to `/api/v1/auth/external-login` returns 302
   - Redirect to Google OAuth
   - Redirect back to `/api/v1/auth/external-auth-callback`
   - Redirect to `http://localhost:3000/auth/callback`
6. ✅ Check browser DevTools → Application tab → Cookies:
   - Verify `AuthTokenHolder` cookie exists
   - Verify it contains `accessToken`, `refreshToken`, and `user`
   - Verify cookie expires in 5 minutes

## Production Deployment Notes

For production:

1. Add production redirect URI to Google Cloud Console:
   ```
   https://api.yourdomain.com/api/v1/auth/external-auth-callback
   ```

2. Update `appsettings.Production.json`:
   ```json
   {
     "FrontendUrl": "https://yourdomain.com",
     "Authentication": {
       "Google": {
         "ClientId": "production-client-id",
         "ClientSecret": "production-client-secret"
       }
     }
   }
   ```

3. Set cookie `Secure = true` for HTTPS

## Expected OAuth Flow

```
1. User clicks "Sign in with Google" on http://localhost:3000/sign-in
   ↓
2. POST http://localhost:5100/api/v1/auth/external-login?provider=Google
   ↓
3. Backend returns Challenge → 302 to Google OAuth
   ↓
4. User authenticates on Google
   ↓
5. Google redirects to http://localhost:5100/api/v1/auth/external-auth-callback?code=...
   ↓
6. Backend processes code, creates/links account, generates JWT
   ↓
7. Backend sets AuthTokenHolder cookie with {accessToken, refreshToken, user}
   ↓
8. Backend redirects to http://localhost:3000/auth/callback
   ↓
9. Frontend extracts tokens from cookie
   ↓
10. Frontend deletes cookie
    ↓
11. Frontend redirects to intended destination or home
```

## Common Issues

### Issue: Cookie not readable by JavaScript
**Cause:** `HttpOnly = true`
**Fix:** Set `HttpOnly = false`

### Issue: Cookie not set
**Cause:** `Secure = true` with HTTP (localhost)
**Fix:** Set `Secure = false` for development

### Issue: redirect_uri_mismatch
**Cause:** Google Cloud Console doesn't have the exact redirect URI
**Fix:** Add `http://localhost:5100/api/v1/auth/external-auth-callback`

### Issue: Frontend doesn't redirect to intended destination
**Cause:** Backend redirecting to `returnUrl` instead of frontend callback
**Fix:** Always redirect to `{frontendUrl}/auth/callback`

### Issue: User profile missing
**Cause:** Cookie doesn't include user data
**Fix:** Add `user = result.User` to cookie serialization
