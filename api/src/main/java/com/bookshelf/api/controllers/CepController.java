package com.bookshelf.api.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cep")
public class CepController {

    private final RestTemplate rest = new RestTemplate();

    @GetMapping("/{cep}")
    public ResponseEntity<?> lookup(@PathVariable String cep) {
        String clean = cep == null ? "" : cep.replaceAll("\\D", "");
        if (clean.length() != 8) {
            return ResponseEntity.badRequest().body("CEP inválido");
        }

        // 1) ViaCEP
        try {
            var via = rest.getForEntity("https://viacep.com.br/ws/" + clean + "/json/", Map.class);
            if (via.getStatusCode().is2xxSuccessful() && via.getBody() != null && !Boolean.TRUE.equals(((Map<?, ?>) via.getBody()).get("erro"))) {
                Map<?, ?> body = (Map<?, ?>) via.getBody();
                return ResponseEntity.ok(mapToDto(clean, (String) body.get("logradouro"), (String) body.get("bairro"), (String) body.get("localidade"), (String) body.get("uf")));
            }
        } catch (RestClientException ignored) { }

        // 2) BrasilAPI
        try {
            var br = rest.getForEntity("https://brasilapi.com.br/api/cep/v1/" + clean, Map.class);
            if (br.getStatusCode().is2xxSuccessful() && br.getBody() != null) {
                Map<?, ?> body = (Map<?, ?>) br.getBody();
                return ResponseEntity.ok(mapToDto(clean,
                        (String) (body.containsKey("street") ? body.get("street") : body.get("logradouro")),
                        (String) (body.containsKey("neighborhood") ? body.get("neighborhood") : body.get("bairro")),
                        (String) (body.containsKey("city") ? body.get("city") : body.get("localidade")),
                        (String) (body.containsKey("state") ? body.get("state") : body.get("uf"))));
            }
        } catch (RestClientException ignored) { }

        return ResponseEntity.ok(mapToDto(clean, null, null, null, null));
    }

    private Map<String, Object> mapToDto(String clean, String street, String neighborhood, String city, String state) {
        Map<String, Object> dto = new HashMap<>();
    dto.put("cep", clean.replaceFirst("(\\d{5})(\\d{3})", "$1-$2"));
        if (street != null) dto.put("street", street);
        if (neighborhood != null) dto.put("neighborhood", neighborhood);
        if (city != null) dto.put("city", city);
        if (state != null) dto.put("state", state);
        return dto;
    }
}
