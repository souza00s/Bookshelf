package com.bookshelf.api.dtos;

import lombok.Getter;
import lombok.Setter;
    import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Getter
@Setter
public class ShippingQuoteRequest {
    private String fromCep; // seller CEP
    private String toCep;   // buyer CEP
    private double weightKg;
    private double lengthCm;
    private double heightCm;
    private double widthCm;
        // Optional snapshot of the destination address when user selects a saved address on the frontend.
        // Not used by current mock calculation, but kept for future audit/logging.
        private AddressSnapshot addressSnapshot;

        @Getter
        @Setter
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class AddressSnapshot {
            private String label;
            private String cep;
            private String street;
            private String number;
            private String complement;
            private String neighborhood;
            private String city;
            private String state;
            private String country;
        }
    }
