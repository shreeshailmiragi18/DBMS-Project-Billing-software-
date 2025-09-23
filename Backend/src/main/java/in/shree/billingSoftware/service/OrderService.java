package in.shree.billingSoftware.service;

import in.shree.billingSoftware.io.OrderRequest;
import in.shree.billingSoftware.io.OrderResponse;
import in.shree.billingSoftware.io.PaymentVerificationRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface  OrderService {
    OrderResponse createOrder(OrderRequest request);
    void deleteOrder(String orderId);
    List<OrderResponse> getLatestOrders();

    OrderResponse verifyPayment(PaymentVerificationRequest request);

    Double sumSalesByDate(LocalDate date);

    Long countByOrderDate(LocalDate date);

    List<OrderResponse> findRecentOrders();
}
