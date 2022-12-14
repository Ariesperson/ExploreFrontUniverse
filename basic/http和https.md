# http和https

## 基本概念:

http:客户端和服务端请求和应答的标准（TCP），用于WWW服务器传输超文本到本地浏览器的**超文本传输协议**。

https: 进行SSL加密http通道。

## 区别和优缺点：

1.https比http更安全，可防止数据在传输过程中被窃取、改变，确保数据的完整性。

2.http默认端口8080 https默认端口是443

3.http的缓存更加高效，https有更多的数据开销。

4.http连接是无状态的。https握手阶段更费时，加载时间更长，耗能更多。

5.https需要ca证书。

6.https的ssl加密证书需要绑定IP，不能再同一个ip上绑定多个域名。

## https协议的工作原理

客户端在使用 HTTPS 方式与 Web 服务器通信时有以下几个步骤：

1.使用https url访问，要求web服务器**建立ssl连接**

2.服务器收到请求后，将**网站的证书（包含公钥），传输给客户端**

3.客户端和服务器**协商SSL连接的安全等级（加密等级）**

4.**建立会话秘钥**，使用公钥加密

5.web服务器通过**私钥解密会话秘钥**

6.web服务器通过**会话秘钥加密通信**

