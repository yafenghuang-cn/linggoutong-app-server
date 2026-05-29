package com.linggoutong.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ConnectionListener {

    private final JdbcTemplate jdbcTemplate;
    private final StringRedisTemplate redisTemplate;

    public ConnectionListener(JdbcTemplate jdbcTemplate, StringRedisTemplate redisTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.redisTemplate = redisTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void checkConnections() {
        checkMySQL();
        checkRedis();
    }

    private void checkMySQL() {
        try {
            String version = jdbcTemplate.queryForObject("SELECT VERSION()", String.class);
            log.info("✅ MySQL 连接成功! 版本: {}", version);
        } catch (Exception e) {
            log.error("❌ MySQL 连接失败: {}", e.getMessage());
        }
    }

    private void checkRedis() {
        try {
            String pong = redisTemplate.getConnectionFactory().getConnection().ping();
            log.info("✅ Redis 连接成功! 响应: {}", pong);
        } catch (Exception e) {
            log.error("❌ Redis 连接失败: {}", e.getMessage());
        }
    }
}
