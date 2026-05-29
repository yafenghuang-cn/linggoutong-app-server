package com.linggoutong.config;

import com.linggoutong.annotation.NoAuth;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;

import java.util.function.Supplier;

@Component
public class NoAuthAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authentication, RequestAuthorizationContext context) {
        // 获取请求对应的处理器方法
        Object handler = context.getRequest().getAttribute("org.springframework.web.servlet.HandlerMapping.bestMatchingHandler");
        if (handler instanceof org.springframework.web.method.HandlerMethod handlerMethod) {
            // 检查方法或类上是否有 @NoAuth 注解
            if (handlerMethod.getMethodAnnotation(NoAuth.class) != null ||
                handlerMethod.getBeanType().isAnnotationPresent(NoAuth.class)) {
                return new AuthorizationDecision(true);
            }
        }

        // 默认需要认证
        return new AuthorizationDecision(false);
    }
}
