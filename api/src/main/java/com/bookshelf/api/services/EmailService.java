package com.bookshelf.api.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.username}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    // Envia em background para não travar a resposta HTTP
    @Async
    public void sendPasswordResetEmail(String toEmail, String userName, String code) {
        String subject = "Recuperação de senha - Bookshelf";
        String safeName = (userName != null && !userName.isBlank()) ? userName : "usuário";
        String html = "<!doctype html>" +
                "<html><head><meta charset='utf-8'>" +
                "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
                "<style>" +
                "body{font-family:Arial,Helvetica,sans-serif;background:#f7f7f9;color:#222;margin:0;padding:24px;}" +
                ".card{max-width:560px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.06);}" +
                ".header{padding:20px 24px;border-bottom:1px solid #eef2f7;}" +
                ".brand{font-weight:700;color:#4f46e5;letter-spacing:.3px;}" +
                ".content{padding:24px;}" +
                ".title{font-size:18px;margin:0 0 12px;}" +
                ".muted{color:#6b7280;font-size:14px;line-height:1.5;}" +
                ".code{display:inline-block;margin:16px 0;padding:12px 18px;font-size:24px;font-weight:700;letter-spacing:6px;color:#111;background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px;}" +
                ".footer{padding:16px 24px;border-top:1px solid #eef2f7;font-size:12px;color:#6b7280;text-align:center;}" +
                "</style></head><body>" +
                "<div class='card'>" +
                "  <div class='header'><span class='brand'>Bookshelf</span></div>" +
                "  <div class='content'>" +
                "    <h1 class='title'>Recuperação de senha</h1>" +
                "    <p class='muted'>Olá, " + safeName + ". Use o código abaixo para redefinir sua senha.</p>" +
                "    <div class='code'>" + code + "</div>" +
                "    <p class='muted'>Este código expira em 5 minutos. Se você não solicitou, ignore este e‑mail.</p>" +
                "  </div>" +
                "  <div class='footer'>© " + java.time.Year.now() + " Bookshelf</div>" +
                "</div>" +
                "</body></html>";

        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, "UTF-8");
            final String from = (fromAddress == null || fromAddress.isBlank()) ? "no-reply@bookshelf.local" : fromAddress;
            final String to = (toEmail == null || toEmail.isBlank()) ? from : toEmail;
            helper.setFrom(java.util.Objects.requireNonNull(from));
            helper.setTo(java.util.Objects.requireNonNull(to));
            helper.setSubject(subject);
            helper.setText(html, true); // HTML
            mailSender.send(mime);
        } catch (MessagingException ex) {
            // Falha no envio não deve quebrar o fluxo HTTP
        }
    }
    
        // Doação confirmada: e-mail para o VENDEDOR
        @Async
        public void sendOrderPaidToSeller(String toEmail, String sellerName, String bookTitle, String amount, String buyerName) {
            String subject = "Doação confirmada - Bookshelf";
            String safeSeller = (sellerName != null && !sellerName.isBlank()) ? sellerName : "doador";
            String safeBuyer = (buyerName != null && !buyerName.isBlank()) ? buyerName : "destinatário";
            String safeTitle = (bookTitle != null && !bookTitle.isBlank()) ? bookTitle : "seu livro";
            String safeAmount = (amount != null && !amount.isBlank()) ? amount : "";
            String html = "<!doctype html><html><head><meta charset='utf-8'>" +
                    "<style>body{font-family:Arial,Helvetica,sans-serif;background:#f7f7f9;color:#222;padding:24px}.card{max-width:560px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.06)}.header{padding:20px 24px;border-bottom:1px solid #eef2f7}.brand{font-weight:700;color:#4f46e5}.content{padding:24px}.title{font-size:18px;margin:0 0 12px}.muted{color:#6b7280}.cta{display:inline-block;margin-top:16px;padding:10px 14px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px}</style></head><body>" +
                    "<div class='card'><div class='header'><span class='brand'>Bookshelf</span></div><div class='content'>" +
                    "<h1 class='title'>Doação confirmada</h1>" +
                    "<p class='muted'>Olá, " + safeSeller + ". O pagamento de " + safeBuyer + " foi concluído.</p>" +
                    "<p>Livro: <b>" + safeTitle + "</b></p>" +
                    (safeAmount.isEmpty() ? "" : "<p>Valor: <b>" + safeAmount + "</b></p>") +
                    "<p>Agora, prepare o envio e informe o código de rastreio na plataforma.</p>" +
                    "</div></div></body></html>";
            try {
                MimeMessage mime = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mime, "UTF-8");
                final String from = (fromAddress == null || fromAddress.isBlank()) ? "no-reply@bookshelf.local" : fromAddress;
                final String to = (toEmail == null || toEmail.isBlank()) ? from : toEmail;
                helper.setFrom(java.util.Objects.requireNonNull(from));
                helper.setTo(java.util.Objects.requireNonNull(to));
                helper.setSubject(subject);
                helper.setText(html, true);
                mailSender.send(mime);
            } catch (Exception ignored) {}
        }

        // Pedido enviado: e-mail para o COMPRADOR
        @Async
        public void sendOrderShippedToBuyer(String toEmail, String buyerName, String bookTitle, String trackingCode) {
            String subject = "Seu pedido foi enviado - Bookshelf";
            String safeBuyer = (buyerName != null && !buyerName.isBlank()) ? buyerName : "destinatário";
            String safeTitle = (bookTitle != null && !bookTitle.isBlank()) ? bookTitle : "seu livro";
            String safeTracking = (trackingCode != null && !trackingCode.isBlank()) ? trackingCode : "";
            String html = "<!doctype html><html><head><meta charset='utf-8'>" +
                    "<style>body{font-family:Arial,Helvetica,sans-serif;background:#f7f7f9;color:#222;padding:24px}.card{max-width:560px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.06)}.header{padding:20px 24px;border-bottom:1px solid #eef2f7}.brand{font-weight:700;color:#4f46e5}.content{padding:24px}.title{font-size:18px;margin:0 0 12px}.muted{color:#6b7280}.badge{display:inline-block;margin-top:12px;padding:8px 12px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px}</style></head><body>" +
                    "<div class='card'><div class='header'><span class='brand'>Bookshelf</span></div><div class='content'>" +
                    "<h1 class='title'>Pedido enviado</h1>" +
                    "<p class='muted'>Olá, " + safeBuyer + ". Seu pedido de <b>" + safeTitle + "</b> foi enviado.</p>" +
                    (safeTracking.isEmpty() ? "" : "<p>Código de rastreio:</p><div class='badge'>" + safeTracking + "</div>") +
                    "<p class='muted'>Você pode acompanhar o pedido na plataforma.</p>" +
                    "</div></div></body></html>";
            try {
                MimeMessage mime = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mime, "UTF-8");
                final String from = (fromAddress == null || fromAddress.isBlank()) ? "no-reply@bookshelf.local" : fromAddress;
                final String to = (toEmail == null || toEmail.isBlank()) ? from : toEmail;
                helper.setFrom(java.util.Objects.requireNonNull(from));
                helper.setTo(java.util.Objects.requireNonNull(to));
                helper.setSubject(subject);
                helper.setText(html, true);
                mailSender.send(mime);
            } catch (Exception ignored) {}
        }
}