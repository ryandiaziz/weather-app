package org.example.models;

public class Response<T> {
    public MetaData metaData;
    public T data;

    public  Response(int status, String message, T data){
        this.metaData = new MetaData(status,message);
        this.data = data;
    }
}
