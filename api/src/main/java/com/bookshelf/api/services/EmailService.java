package com.bookshelf.api.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Value("${sendgrid.apiKey}")
    private String sendgridApiKey;

    @Value("${sendgrid.from}")
    private String fromAddress;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${sendgrid.templateId:}")
    private String templateId;

    @Value("${sendgrid.enabled:true}")
    private boolean sendgridEnabled;

    public void sendPasswordResetEmail(String toEmail, String userName, String code) {
        if (!sendgridEnabled) {
            // Dev mode: don't actually call SendGrid
            System.out.println("[EmailService] sendgrid.enabled=false; mock send to " + toEmail + " with code " + code);
            return;
        }
        String url = "https://api.sendgrid.com/v3/mail/send";

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, String> from = new HashMap<>();
        from.put("email", fromAddress);
        from.put("name", "Bookshelf");

        Map<String, Object> personalization = new HashMap<>();
        personalization.put("to", List.of(Map.of("email", toEmail, "name", userName)));

        if (templateId != null && !templateId.isBlank()) {
            // dynamic template
            Map<String, Object> dyn = new HashMap<>();
            dyn.put("userName", userName);
            dyn.put("code", code);
            personalization.put("dynamic_template_data", dyn);
            requestBody.put("template_id", templateId);
        } else {
            // plain content fallback
            personalization.put("subject", "Recuperação de senha - Código de verificação");
            Map<String, String> content = new HashMap<>();
            content.put("type", "text/plain");
            content.put("value", "Olá, " + userName + ",\n\n" +
                    "Seu código de verificação é: " + code + ".\n" +
                    "Ele expira em 30 minutos.\n\n" +
                    "Se você não solicitou, ignore este e-mail.\n\n" +
                    "Bookshelf");
            requestBody.put("content", List.of(content));
        }

        requestBody.put("from", from);
        requestBody.put("personalizations", List.of(personalization));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(sendgridApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        restTemplate.postForEntity(url, entity, String.class);
    }
}