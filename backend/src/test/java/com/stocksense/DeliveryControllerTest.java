package com.stocksense;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stocksense.dto.DeliveryItemRequest;
import com.stocksense.dto.DeliveryRequest;
import com.stocksense.entity.Delivery;
import com.stocksense.entity.DeliveryItem;
import com.stocksense.entity.DeliveryStatus;
import com.stocksense.entity.Product;
import com.stocksense.repository.DeliveryRepository;
import com.stocksense.repository.ProductRepository;
import com.stocksense.security.CustomUserDetailsService;
import com.stocksense.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class DeliveryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    private String validJwtToken;
    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        UserDetails adminDetails = userDetailsService.loadUserByUsername("admin@stocksense.com");
        validJwtToken = "Bearer " + jwtService.generateToken(adminDetails);

        sampleProduct = productRepository.findBySku("CTRL-PROD-001").orElseGet(() -> {
            Product p = new Product();
            p.setName("Controller Test Item");
            p.setSku("CTRL-PROD-001");
            p.setUnitOfMeasure("Units");
            p.setCostPrice(new BigDecimal("20.00"));
            p.setSalesPrice(new BigDecimal("35.00"));
            p.setQuantityOnHand(100);
            p.setReorderPoint(10);
            return productRepository.save(p);
        });
        sampleProduct.setQuantityOnHand(100);
        productRepository.save(sampleProduct);
    }

    @Test
    @DisplayName("API Security: Unauthenticated request should be rejected (403 Forbidden)")
    void testUnauthenticatedAccessRejected() throws Exception {
        mockMvc.perform(get("/api/deliveries"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/deliveries - List all deliveries with JWT")
    void testGetAllDeliveries() throws Exception {
        mockMvc.perform(get("/api/deliveries")
                        .header("Authorization", validJwtToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", isA(List.class)));
    }

    @Test
    @DisplayName("POST /api/deliveries - Create new delivery order")
    void testCreateDeliveryEndpoint() throws Exception {
        DeliveryRequest request = new DeliveryRequest();
        request.setCustomerName("Falcon Dynamics");
        request.setItems(List.of(new DeliveryItemRequest(sampleProduct.getId(), 4)));

        mockMvc.perform(post("/api/deliveries")
                        .header("Authorization", validJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.customerName", is("Falcon Dynamics")))
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andExpect(jsonPath("$.totalQuantity", is(4)));
    }

    @Test
    @DisplayName("Complete API lifecycle: Create -> Pick -> Pack -> Validate")
    void testCompleteApiLifecycle() throws Exception {
        // 1. Create
        DeliveryRequest request = new DeliveryRequest();
        request.setCustomerName("Starlight Industries");
        request.setItems(List.of(new DeliveryItemRequest(sampleProduct.getId(), 5)));

        String createResponse = mockMvc.perform(post("/api/deliveries")
                        .header("Authorization", validJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andReturn().getResponse().getContentAsString();

        Long deliveryId = objectMapper.readTree(createResponse).get("id").asLong();

        // 2. Pick
        mockMvc.perform(post("/api/deliveries/" + deliveryId + "/pick")
                        .header("Authorization", validJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PICKED")));

        // 3. Pack
        mockMvc.perform(post("/api/deliveries/" + deliveryId + "/pack")
                        .header("Authorization", validJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PACKED")));

        // 4. Validate
        mockMvc.perform(post("/api/deliveries/" + deliveryId + "/validate")
                        .header("Authorization", validJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("VALIDATED")));

        // 5. Get details
        mockMvc.perform(get("/api/deliveries/" + deliveryId)
                        .header("Authorization", validJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(deliveryId.intValue())))
                .andExpect(jsonPath("$.status", is("VALIDATED")));

        // 6. Check stock ledger for this delivery
        mockMvc.perform(get("/api/deliveries/" + deliveryId + "/ledger")
                        .header("Authorization", validJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].quantityChange", is(-5)))
                .andExpect(jsonPath("$[0].movementType", is("DELIVERY")));
    }

    @Test
    @DisplayName("Error Handling: Trying to pack a DRAFT delivery returns 400 Bad Request")
    void testInvalidStatusErrorHandling() throws Exception {
        DeliveryRequest request = new DeliveryRequest();
        request.setCustomerName("Error Case Logistics");
        request.setItems(List.of(new DeliveryItemRequest(sampleProduct.getId(), 2)));

        String response = mockMvc.perform(post("/api/deliveries")
                        .header("Authorization", validJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long deliveryId = objectMapper.readTree(response).get("id").asLong();

        // Attempt pack directly
        mockMvc.perform(post("/api/deliveries/" + deliveryId + "/pack")
                        .header("Authorization", validJwtToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("must be PICKED before packing")));
    }
}
