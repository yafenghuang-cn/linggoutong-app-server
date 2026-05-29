package com.linggoutong.common;

import lombok.Data;

/**
 * 全局统一响应封装类
 */
@Data
public class Result<T> {

    /** 状态码：0-成功，其他-失败 */
    private int code;

    /** 响应消息 */
    private String message;

    /** 响应数据 */
    private T data;

    /** 成功状态码 */
    private static final int SUCCESS_CODE = 0;

    /** 默认错误状态码 */
    private static final int DEFAULT_ERROR_CODE = 9999;

    /** 默认成功消息 */
    private static final String SUCCESS_MESSAGE = "操作成功";

    /** 默认错误消息 */
    private static final String DEFAULT_ERROR_MESSAGE = "操作失败";

    private Result() {
    }

    private Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    /**
     * 成功响应（无数据）
     */
    public static <T> Result<T> success() {
        return new Result<>(SUCCESS_CODE, SUCCESS_MESSAGE, null);
    }

    /**
     * 成功响应（带数据）
     */
    public static <T> Result<T> success(T data) {
        return new Result<>(SUCCESS_CODE, SUCCESS_MESSAGE, data);
    }

    /**
     * 成功响应（带消息和数据）
     */
    public static <T> Result<T> success(String message, T data) {
        return new Result<>(SUCCESS_CODE, message, data);
    }

    /**
     * 失败响应（默认错误码 9999）
     */
    public static <T> Result<T> error() {
        return new Result<>(DEFAULT_ERROR_CODE, DEFAULT_ERROR_MESSAGE, null);
    }

    /**
     * 失败响应（自定义消息，默认错误码 9999）
     */
    public static <T> Result<T> error(String message) {
        return new Result<>(DEFAULT_ERROR_CODE, message, null);
    }

    /**
     * 失败响应（自定义错误码和消息）
     */
    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message, null);
    }

    /**
     * 失败响应（自定义错误码、消息和数据）
     */
    public static <T> Result<T> error(int code, String message, T data) {
        return new Result<>(code, message, data);
    }

    /**
     * 判断是否成功
     */
    public boolean isSuccess() {
        return this.code == SUCCESS_CODE;
    }
}
