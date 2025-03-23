/**
 * This file contains email template configurations for Supabase Auth.
 * 
 * Note: These templates need to be configured in the Supabase dashboard.
 * This file serves as a reference for what to paste in the Supabase Email Templates section.
 */

/**
 * Confirmation Email Template
 * 
 * This is the email sent to users when they sign up.
 * Copy this HTML into the Supabase Dashboard > Authentication > Email Templates > Confirmation
 */
export const confirmationEmailTemplate = `
<h2>Confirm your signup to AlgoZ</h2>

<p>Follow this link to confirm your user account for AlgoZ:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email address</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>If you didn't sign up for AlgoZ, you can safely ignore this email.</p>

<p>Thanks,<br>The AlgoZ Team</p>
`;

/**
 * Magic Link Email Template
 * 
 * This is the email sent to users when they request a magic link.
 * Copy this HTML into the Supabase Dashboard > Authentication > Email Templates > Magic Link
 */
export const magicLinkEmailTemplate = `
<h2>Login to AlgoZ</h2>

<p>Follow this link to log in to your AlgoZ account:</p>
<p><a href="{{ .SiteURL }}/auth/callback?token={{ .Token }}&type=magiclink">Log in to AlgoZ</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .SiteURL }}/auth/callback?token={{ .Token }}&type=magiclink</p>

<p>If you didn't request this link, you can safely ignore this email.</p>

<p>Thanks,<br>The AlgoZ Team</p>
`;

/**
 * Reset Password Email Template
 * 
 * This is the email sent to users when they request a password reset.
 * Copy this HTML into the Supabase Dashboard > Authentication > Email Templates > Reset Password
 */
export const resetPasswordEmailTemplate = `
<h2>Reset your AlgoZ password</h2>

<p>Follow this link to reset the password for your AlgoZ account:</p>
<p><a href="{{ .SiteURL }}/auth/reset-password?token={{ .Token }}">Reset your password</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .SiteURL }}/auth/reset-password?token={{ .Token }}</p>

<p>If you didn't request a password reset, you can safely ignore this email.</p>

<p>Thanks,<br>The AlgoZ Team</p>
`;

/**
 * Change Email Address Template
 * 
 * This is the email sent to users when they request to change their email.
 * Copy this HTML into the Supabase Dashboard > Authentication > Email Templates > Change Email Address
 */
export const changeEmailTemplate = `
<h2>Confirm your new email for AlgoZ</h2>

<p>Follow this link to confirm your new email address for AlgoZ:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your new email</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>If you didn't request this change, you can safely ignore this email.</p>

<p>Thanks,<br>The AlgoZ Team</p>
`;