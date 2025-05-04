package com.enspy.webtree.services;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.filter.OncePerRequestFilter;

import com.enspy.webtree.models.Users;
import com.enspy.webtree.repositories.*;
import java.io.IOException;

@Service
@AllArgsConstructor
public class JWTFilter extends OncePerRequestFilter {
    private final JWTService jwtService;
    private final UserService userService;
    private final UserRepository userRepository; // doit exposer à la fois loadUserByUsername et findByUsername

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);
            try {
                if (!jwtService.isTokenExpired(token)) {
                    String username = jwtService.extractUsername(token);

                    // Récupérer d'abord le UserDetails pour les rôles
                    UserDetails userDetails = userService.loadUserByUsername(username);
                    // Puis récupérer votre entité Users pour l'utiliser comme principal
                    Users userEntity = userRepository.findByUsername(username);

                    // S'assurer qu'aucune authentification n'est déjà en place
                    if (username != null &&
                        SecurityContextHolder.getContext().getAuthentication() == null) {

                        UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                /* principal = */ userEntity,
                                /* credentials = */ null,
                                /* authorities = */ userDetails.getAuthorities()
                            );

                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            } catch (ExpiredJwtException e) {
                logger.warn("Le jeton JWT est expiré", e);
            } catch (SignatureException e) {
                logger.error("Signature JWT invalide", e);
            } catch (Exception e) {
                logger.error("Erreur lors de la validation du JWT", e);
            }
        }

        filterChain.doFilter(request, response);
    }
}
