import os
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from jinja2 import Template

load_dotenv()

def obtener_config_mail():
    load_dotenv(override=True)
    username = os.getenv("MAIL_USERNAME", "noreply@guella.com").strip()
    password = os.getenv("MAIL_PASSWORD", "").replace(" ", "").strip()
    mail_from = os.getenv("MAIL_FROM", username if "@" in username else "noreply@guella.com").strip()
    if not mail_from or "@" not in mail_from:
        mail_from = "noreply@guella.com"
        
    port = int(os.getenv("MAIL_PORT", "587"))
    ssl_tls_env = os.getenv("MAIL_SSL_TLS")
    starttls_env = os.getenv("MAIL_STARTTLS")
    
    use_ssl = ssl_tls_env.lower() in ("true", "1", "yes") if ssl_tls_env is not None else (port == 465)
    use_starttls = starttls_env.lower() in ("true", "1", "yes") if starttls_env is not None else (port != 465)

    return ConnectionConfig(
        MAIL_USERNAME=username,
        MAIL_PASSWORD=password,
        MAIL_FROM=mail_from,
        MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "Güella MRV").strip(),
        MAIL_PORT=port,
        MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com").strip(),
        MAIL_STARTTLS=use_starttls,
        MAIL_SSL_TLS=use_ssl,
        USE_CREDENTIALS=bool(username and password and "tu_email" not in username),
        VALIDATE_CERTS=True,
    )

PLANTILLA_RESET = """
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de contraseña - Güella</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:580px;margin:40px auto;padding:0 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:56px;height:56px;background:linear-gradient(135deg,#10b981,#14b8a6);border-radius:16px;line-height:56px;font-size:28px;font-weight:900;color:#fff;">G</div>
      <p style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:8px 0 0;">MRV Platform</p>
    </div>

    <!-- Card -->
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:40px 36px;">
      <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">Recuperá tu contraseña</h1>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;line-height:1.6;">
        Hola <strong style="color:#e2e8f0;">{{ nombre }}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta en Güella.
      </p>

      <p style="color:#94a3b8;font-size:14px;margin:0 0 20px;">
        Hacé clic en el botón para definir una nueva contraseña. Este enlace es válido por <strong style="color:#e2e8f0;">1 hora</strong>.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin:28px 0;">
        <a href="{{ reset_url }}"
           style="display:inline-block;background:linear-gradient(135deg,#10b981,#14b8a6);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:12px;letter-spacing:0.3px;">
          Restablecer contraseña
        </a>
      </div>

      <p style="color:#64748b;font-size:12px;margin:24px 0 0;line-height:1.6;">
        Si no solicitaste este cambio, podés ignorar este email. Tu contraseña actual no será modificada.
      </p>

      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0;">

      <p style="color:#475569;font-size:11px;margin:0;line-height:1.6;">
        Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
        <a href="{{ reset_url }}" style="color:#10b981;word-break:break-all;">{{ reset_url }}</a>
      </p>
    </div>

    <p style="text-align:center;color:#334155;font-size:11px;margin-top:24px;">
      © Güella MRV Platform. Este es un correo automático, no respondas a este mensaje.
    </p>
  </div>
</body>
</html>
"""


import asyncio
import json
import urllib.request
import urllib.error


def _enviar_via_resend(api_key: str, destinatario: str, nombre: str, html: str) -> bool:
    """Envío instantáneo vía Resend REST API (Puerto HTTPS 443, no bloqueado por Render)."""
    url = "https://api.resend.com/emails"
    from_name = os.getenv("MAIL_FROM_NAME", "Güella MRV").strip()
    from_email = os.getenv("RESEND_FROM", "onboarding@resend.dev").strip()
    
    headers = {
        "Authorization": f"Bearer {api_key.strip()}",
        "Content-Type": "application/json",
        "User-Agent": "Guella-MRV/1.0"
    }
    payload = {
        "from": f"{from_name} <{from_email}>",
        "to": [destinatario],
        "subject": "Recuperá tu contraseña — Güella MRV",
        "html": html
    }
    
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (200, 201):
                print(f"[OK] Email enviado exitosamente vía Resend API a {destinatario}")
                return True
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"[ERROR] Error HTTP al enviar vía Resend ({e.code}): {error_body}")
        raise e
    except Exception as e:
        print(f"[ERROR] Error de conexión al enviar vía Resend: {e}")
        raise e
    return False


def _enviar_via_brevo(api_key: str, destinatario: str, nombre: str, html: str) -> bool:
    """Envío instantáneo vía Brevo REST API (Puerto HTTPS 443, no bloqueado por Render)."""
    url = "https://api.brevo.com/v3/smtp/email"
    from_name = os.getenv("MAIL_FROM_NAME", "Güella MRV").strip()
    from_email = os.getenv("MAIL_FROM", os.getenv("MAIL_USERNAME", "guellamedicion@gmail.com")).strip()
    
    headers = {
        "api-key": api_key.strip(),
        "Content-Type": "application/json",
        "User-Agent": "Guella-MRV/1.0"
    }
    payload = {
        "sender": {"name": from_name, "email": from_email},
        "to": [{"email": destinatario, "name": nombre}],
        "subject": "Recuperá tu contraseña — Güella MRV",
        "htmlContent": html
    }
    
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (200, 201):
                print(f"[OK] Email enviado exitosamente vía Brevo API a {destinatario}")
                return True
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"[ERROR] Error HTTP al enviar vía Brevo ({e.code}): {error_body}")
        raise e
    except Exception as e:
        print(f"[ERROR] Error de conexión al enviar vía Brevo: {e}")
        raise e
    return False


async def enviar_email_reset_password(email: str, nombre: str, reset_url: str):
    """Envía el email de recuperación de contraseña usando HTTP API o SMTP como fallback."""
    print("\n=======================================================")
    print("[RECUPERACION DE CONTRASENA]")
    print(f"Para: {nombre} ({email})")
    print(f"Link: {reset_url}")
    print("=======================================================\n")

    html = Template(PLANTILLA_RESET).render(nombre=nombre, reset_url=reset_url)

    # 1. Intentar con Resend API (HTTP REST - instantáneo y 100% compatible con Render Free)
    resend_key = os.getenv("RESEND_API_KEY", "").strip()
    if resend_key:
        return await asyncio.to_thread(_enviar_via_resend, resend_key, email, nombre, html)

    # 2. Intentar con Brevo API (HTTP REST - instantáneo y 100% compatible con Render Free)
    brevo_key = os.getenv("BREVO_API_KEY", "").strip()
    if brevo_key:
        return await asyncio.to_thread(_enviar_via_brevo, brevo_key, email, nombre, html)

    # 3. Fallback a SMTP tradicional
    config = obtener_config_mail()
    username = os.getenv("MAIL_USERNAME", "")
    password = os.getenv("MAIL_PASSWORD", "")
    if not username or "tu_email" in username or not password or "tu_app_password" in password:
        print("[AVISO] Variables de email no configuradas en el servidor de producción.")
        print("[INFO] Por seguridad se imprimió el link arriba en los logs del servidor.")
        return False

    mensaje = MessageSchema(
        subject="Recuperá tu contraseña — Güella MRV",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )

    try:
        fm = FastMail(config)
        await fm.send_message(mensaje)
        print(f"[OK] Email de recuperación enviado con éxito vía SMTP a {email}")
        return True
    except Exception as e:
        print(f"[ERROR] Error al conectar/enviar con servidor SMTP ({config.MAIL_SERVER}:{config.MAIL_PORT}): {e}")
        print(f"[INFO] Render Free bloquea conexiones SMTP. Se recomienda configurar RESEND_API_KEY.")
        raise e

