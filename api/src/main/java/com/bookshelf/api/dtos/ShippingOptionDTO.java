package com.bookshelf.api.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShippingOptionDTO {
    private String serviceCode; // e.g., PAC, SEDEX
    private String serviceName;
    private double price;
    private String deliveryTime; // e.g., "3-7 dias úteis"
}
