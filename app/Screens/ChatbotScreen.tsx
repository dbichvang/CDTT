// import React, { useState } from "react";
// import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
// import axios from "axios";

// export default function ChatbotScreen() {
//   const [message, setMessage] = useState("");
//   const [chatLog, setChatLog] = useState<{ role: string; text: string }[]>([]);
//   const [loading, setLoading] = useState(false);

//   const handleSend = async () => {
//     if (!message.trim()) return;
//     const userMessage = message.trim();

//     setChatLog([...chatLog, { role: "user", text: userMessage }]);
//     setMessage("");
//     setLoading(true);

//     try {
//       const res = await axios.post("http://10.18.12.179:8082/webhook/chatbot", { message: userMessage });
//       const reply = res.data.reply || "Chatbot không trả lời được.";

//       setChatLog((prev) => [...prev, { role: "bot", text: reply }]);
//     } catch (err: any) {
//       console.error("Chatbot error:", err.response?.data || err.message);
//       setChatLog((prev) => [...prev, { role: "bot", text: "Lỗi khi gọi chatbot." }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView style={styles.chatContainer}>
//         {chatLog.map((msg, idx) => (
//           <View key={idx} style={[styles.messageBox, msg.role === "user" ? styles.userBox : styles.botBox]}>
//             <Text style={styles.messageText}>{msg.text}</Text>
//           </View>
//         ))}
//       </ScrollView>

//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Nhập tin nhắn..."
//           value={message}
//           onChangeText={setMessage}
//         />
//         <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
//           {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Gửi</Text>}
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 10, backgroundColor: "#f5f5f5" },
//   chatContainer: { flex: 1, marginBottom: 10 },
//   messageBox: { marginVertical: 5, padding: 10, borderRadius: 8, maxWidth: "80%" },
//   userBox: { alignSelf: "flex-end", backgroundColor: "#4e8cff" },
//   botBox: { alignSelf: "flex-start", backgroundColor: "#ccc" },
//   messageText: { color: "#fff" },
//   inputContainer: { flexDirection: "row", alignItems: "center" },
//   input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, backgroundColor: "#fff" },
//   sendButton: { marginLeft: 5, backgroundColor: "#4e8cff", padding: 12, borderRadius: 8 },
//   sendText: { color: "#fff", fontWeight: "bold" },
// });

import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ChatbotScreen() {
  const navigation = useNavigation();
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<{role: string, text: string}[]>([]);

  // Tin nhắn hướng dẫn mặc định
  const defaultBotMessages = [
    "Chào bạn! Mình là trợ lý mua hàng.",
    "Bạn có thể hỏi cách mua sản phẩm, thanh toán, hoặc theo dõi đơn hàng.",
    "Ví dụ: 'Làm sao để mua đồng hồ?', 'Thanh toán bằng VNPay thế nào?'"
  ];

  useEffect(() => {
    const initialMessages = defaultBotMessages.map(text => ({ role: "bot", text }));
    setChatLog(initialMessages);
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    const userMessage = message.trim();

    setChatLog(prev => [...prev, { role: "user", text: userMessage }]);

    let botReply = "Mình chưa hiểu câu hỏi của bạn, bạn có thể hỏi lại câu khác để mình giải đáp nhé.";
    
    if (userMessage.toLowerCase().includes("mua")) {
      botReply = "Để mua hàng, bạn chọn sản phẩm, thêm vào giỏ, rồi thanh toán.";
    } else if (userMessage.toLowerCase().includes("thanh toán")) {
      botReply = "Bạn có thể thanh toán bằng VNPay hoặc thanh toán khi nhận hàng nha.";
    } else if (userMessage.toLowerCase().includes("theo dõi")) {
      botReply = "Bạn có thể theo dõi đơn hàng của mình trong mục 'Đơn hàng của tôi'.";
    } else if (userMessage.toLowerCase().includes("giá")) {
      botReply = "Bạn có thể tìm kiếm giá trong mục 'Tìm kiếm'.";
    } else if (userMessage.toLowerCase().includes("sản phẩm")) {
      botReply = "Trang chủ của bên mình có lọc ra các sản phẩm theo danh mục bạn có thể lựa chọn sản phẩm ở đó";
    } else if (userMessage.toLowerCase().includes("danh mục")) {
      botReply = "Bên mình có các danh mục như: Điện thoại, Laptop, Tai nghe, ... Bạn muốn xem danh mục nào?";
    } else if (userMessage.toLowerCase().includes("bán")) {
      botReply = "Bên mình không hỗ trợ bán hàng qua chat, bạn vui lòng truy cập vào trang web để thực hiện giao dịch.";
    } else if (userMessage.toLowerCase().includes("điện thoại")) {
      botReply = "Bên mình bán đủ các dòng điện thoại của iphone ạ!.";
    } else if (userMessage.toLowerCase().includes("laptop")) {
      botReply = "Bên mình bán đủ các dòng laptop ạ!.";
    } else if (userMessage.toLowerCase().includes("màn hình")) {
      botReply = "Bên mình bán đủ các dòng màn hình ạ!.";
    } else if (userMessage.toLowerCase().includes("chào")) {
      botReply = "Xin chào người đẹp, người đẹp cần gì cứ hỏi mình sẽ trả lời trong khả năng của mình nhé'.";
    } else if (userMessage.toLowerCase().includes("hello")) {
      botReply = "Xin chào người đẹp, người đẹp cần gì cứ hỏi mình sẽ trả lời trong khả năng của mình nhé'.";
    } else if (userMessage.toLowerCase().includes("cảm ơn")) {
      botReply = "Không có gì, người đẹp cần gì cứ hỏi mình nhé.";
    }else if (userMessage.toLowerCase().includes("CSKH")) {
      botReply = "Bạn hãy để lại thông tin, mình sẽ chuyển đến bộ phận CSKH nhé.";
    }else if (userMessage.toLowerCase().includes("giao hàng")) {
      botReply = "Bạn hãy để lại thông tin, mình sẽ chuyển đến bộ phận giao hàng nhé.";
    }



    setChatLog(prev => [...prev, { role: "bot", text: botReply }]);
    setMessage("");
  };

  return (
    <View style={styles.container}>
      {/* Nút Quay lại */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <ScrollView style={styles.chatContainer}>
        {chatLog.map((msg, index) => (
          <View
            key={index}
            style={[styles.messageBox, msg.role === "user" ? styles.userBox : styles.botBox]}
          >
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Nhập tin nhắn..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
  backButton: { padding: 10, backgroundColor: "silver", borderRadius: 8, marginBottom: 5, alignSelf: "flex-start" },
  backText: { fontWeight: "bold", color: "#000" },
  chatContainer: { flex: 1, marginBottom: 10 },
  messageBox: { marginVertical: 5, padding: 10, borderRadius: 8, maxWidth: "80%" },
  userBox: { alignSelf: "flex-end", backgroundColor: "#4e8cff" },
  botBox: { alignSelf: "flex-start", backgroundColor: "#ccc" },
  messageText: { color: "#fff" },
  inputContainer: { flexDirection: "row", alignItems: "center" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, backgroundColor: "#fff" },
  sendButton: { marginLeft: 5, backgroundColor: "#4e8cff", padding: 12, borderRadius: 8 },
  sendText: { color: "#fff", fontWeight: "bold" },
});
