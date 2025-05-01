package com.enspy.webtree.services;

import com.enspy.webtree.models.Family;
import com.enspy.webtree.models.Users;
import com.enspy.webtree.repositories.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.*;
import java.util.function.Function;

@Service
public class JWTService {

    private UserRepository userRepository;
    private final String ENCRIPTION_KEY = "faceb782375b50f9d24e043beeca80fae093c934cbf0ade576f4b36258de6b44";

    public Map<String, Object> generate(String username) {
        Users user = userRepository.findByUsername(username).get();
        return generateJWT(user);
    }

    public Map<String, Object> generateJWT(Users user) {
        final long currenttime = System.currentTimeMillis();
        long expiration = 0;

            expiration = currenttime + 30 * 60 * 1000;// Un token de 30 min

        final Map<String, Object> claims = Map.of(
                "hashId", "",
                "FirstName", user.getFirstName(),
                "LastName", user.getLastName(),
                "userId", user.getId() + "",
                Claims.EXPIRATION, new Date(expiration),
                Claims.SUBJECT, user.getUsername());

        String bearer = Jwts.builder()
                .claims(claims)
                .subject(user.getUsername())
                .issuedAt(new Date(currenttime))
                .expiration(new Date(expiration))
                .signWith(getKey())
                .compact();



        Map<String, Object> map = new HashMap<>();
        map.put("Bearer", bearer);
        map.put("ExpireAt", new Date(expiration));

        return map;

    }


    public Map<String, Object> generateFamilyToken(Family family) {
        final long currenttime = System.currentTimeMillis();
        long expiration = 0;

        expiration = currenttime + 30 * 60 * 1000;// Un token de 30 min

        final Map<String, Object> claims = Map.of(
                "hashId", "",
                "familyName", family.getFamilyName(),
                "userId", family.getId() + "",
                Claims.EXPIRATION, new Date(expiration),
                Claims.SUBJECT, family.getId());

        String bearer = Jwts.builder()
                .claims(claims)
                .subject(family.getFamilyName())
                .issuedAt(new Date(currenttime))
                .expiration(new Date(expiration))
                .signWith(getKey())
                .compact();

        Map<String, Object> map = new HashMap<>();
        map.put("Bearer", bearer);
        map.put("ExpireAt", new Date(expiration));

        return map;

    }

    private Key getKey() {
        final byte[] decoder = Decoders.BASE64.decode(ENCRIPTION_KEY);
        return Keys.hmacShaKeyFor(decoder);
    }

    public String extractUsername(String token) {
        return this.getClaim(token, Claims::getSubject);
    }

    public boolean isTokenExpired(String token) {
        Date expirationDate = this.getClaim(token, Claims::getExpiration);
        return expirationDate.before(new Date());
    }

    private <T> T getClaim(String token, Function<Claims, T> function) {
        Claims claims = getAllClaims(token);
        return function.apply(claims);
    }

    private Claims getAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(this.getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }


}
