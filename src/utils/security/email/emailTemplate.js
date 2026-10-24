const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]);
export const emailTemplate = ({otp, subject}) => {
    const safeOtp = escapeHtml(otp)
    const safeSubject = escapeHtml(subject)

    return `
        <!doctype html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>${safeSubject}</title>
            </head>
            <body style="margin:0;padding:32px;background:#f4f6f8;font-family:Arial,sans-serif;color:#202124;">
                <main style="max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;">
                    <h1 style="margin:0 0 16px;font-size:24px;">${safeSubject}</h1>
                    <p style="margin:0 0 20px;font-size:16px;line-height:1.5;">Use this verification code to continue:</p>
                    <p style="margin:0;padding:16px;text-align:center;background:#f4f6f8;border-radius:8px;font-size:32px;font-weight:bold;letter-spacing:8px;">${safeOtp}</p>
                    <p style="margin:20px 0 0;font-size:13px;color:#5f6368;">If you didn't request this code, you can ignore this email.</p>
                </main>
            </body>
        </html>
    `
}
