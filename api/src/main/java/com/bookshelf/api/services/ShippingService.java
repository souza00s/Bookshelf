package com.bookshelf.api.services;

import com.bookshelf.api.dtos.ShippingOptionDTO;
import com.bookshelf.api.dtos.ShippingQuoteRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShippingService {
    public List<ShippingOptionDTO> quote(ShippingQuoteRequest req) {
        // TODO: Integrate with Correios API or provider. For now, simple mock.
        double base = 10.0; // base fee
        double weightFactor = Math.max(0.0, req.getWeightKg() - 0.3) * 5.0;
        double sizeFactor = ((req.getLengthCm() + req.getHeightCm() + req.getWidthCm()) / 100.0);
        double pac = Math.round((base + weightFactor + sizeFactor) * 100.0) / 100.0;
        double sedex = Math.round((pac * 1.6) * 100.0) / 100.0;

        return List.of(
                new ShippingOptionDTO("PAC", "PAC (Econômico)", pac, "5-8 dias úteis"),
                new ShippingOptionDTO("SEDEX", "SEDEX (Expresso)", sedex, "2-4 dias úteis")
        );
    }
}
