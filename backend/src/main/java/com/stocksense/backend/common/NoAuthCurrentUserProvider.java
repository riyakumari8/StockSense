package com.stocksense.backend.common;

import java.util.Optional;
import org.springframework.stereotype.Component;

/**
 * Temporary default implementation of {@link CurrentUserProvider}, active
 * until the auth module is wired in.
 *
 * TODO(auth owner): delete this class and provide a real
 * {@code CurrentUserProvider} bean backed by Spring Security /
 * SecurityContextHolder once JWT auth exists. Nothing in the warehouse,
 * location, stock, transfer, adjustment or ledger packages needs to change
 * when that happens -- they only depend on the interface.
 */
@Component
public class NoAuthCurrentUserProvider implements CurrentUserProvider {

    @Override
    public Optional<Long> getCurrentUserId() {
        return Optional.empty();
    }
}
