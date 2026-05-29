package com.linggoutong.config;

import com.linggoutong.common.JwtUtils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
public class RedisJwtDecoder implements JwtDecoder {

    private final JwtUtils jwtUtils;
    private final StringRedisTemplate redisTemplate;
    private final SecretKey secretKey;

    public RedisJwtDecoder(JwtUtils jwtUtils, StringRedisTemplate redisTemplate) {
        this.jwtUtils = jwtUtils;
        this.redisTemplate = redisTemplate;
        this.secretKey = Keys.hmacShaKeyFor(jwtUtils.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            // 解析 JWT
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // 获取用户ID
            Long userId = claims.get("userId", Long.class);

            // 检查 Redis 中是否存在该 token
            String redisToken = redisTemplate.opsForValue().get("user:token:" + userId);
            if (redisToken == null || !redisToken.equals(token)) {
                log.warn("Token 在 Redis 中不存在或不匹配，userId: {}", userId);
                throw new OAuth2AuthenticationException(new OAuth2Error("invalid_token", "Token 已失效，请重新登录", null));
            }

            // 构建 Jwt 对象
            Map<String, Object> headers = new HashMap<>();
            headers.put("alg", "HS256");
            headers.put("typ", "JWT");

            return new Jwt(
                    token,
                    claims.getIssuedAt().toInstant(),
                    claims.getExpiration().toInstant(),
                    headers,
                    claims
            );
        } catch (OAuth2AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            log.error("JWT 解析失败: {}", e.getMessage());
            throw new JwtException("无效的 Token");
        }
    }
}
