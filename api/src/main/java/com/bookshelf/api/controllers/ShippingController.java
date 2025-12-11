package com.bookshelf.api.controllers;

import com.bookshelf.api.dtos.ShippingOptionDTO;
import com.bookshelf.api.dtos.ShippingQuoteRequest;
import com.bookshelf.api.services.ShippingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipping")
public class ShippingController {

    private final ShippingService shippingService;

    public ShippingController(ShippingService shippingService) {
        this.shippingService = shippingService;
    }

    @PostMapping("/quote")
    public ResponseEntity<List<ShippingOptionDTO>> quote(@RequestBody ShippingQuoteRequest req) {
        return ResponseEntity.ok(shippingService.quote(req));
    }
}
