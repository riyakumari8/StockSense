package com.stocksense.backend.common;

import java.util.Optional;

/**
 * Integration point for the authentication module.
 *
 * Member 4's services need to stamp "created by" / "performed by" /
 * "validated by" / "approved by" on transfers, adjustments and ledger
 * entries, but no authentication module exists in this repository yet.
 *
 * Once the auth-owning member introduces Spring Security + JWT, they should
 * provide a real {@code @Component} implementation of this interface (e.g.
 * reading the authenticated principal's user id out of the
 * SecurityContext) and remove {@link NoAuthCurrentUserProvider}. No other
 * class in this module needs to change.
 */
public interface CurrentUserProvider {

    /**
     * @return the id of the currently authenticated user, or empty if there
     * is no authenticated user (e.g. no auth module wired up yet, or an
     * anonymous/system-initiated action).
     */
    Optional<Long> getCurrentUserId();
}
