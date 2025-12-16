// frontend/src/App.jsx
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth"; // 로그인 함수
import "./App.css?v=1";

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('ID(이메일)와 PASSWORD를 모두 입력해 주세요.');
      return;
    }

    try {
      // 1. 파이어베이스 로그인 시도
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. 백엔드 전송용 토큰 뽑기 (나중에 FastAPI로 보낼 예정)
      const token = await user.getIdToken();
      
      console.log("로그인 성공!");
      console.log("유저 이메일:", user.email);
      console.log("인증 토큰:", token);

      alert(`${user.email}님 환영합니다!`);
      // navigate("/main"); // 로그인 성공 후 이동할 페이지가 있다면 주석 해제
      // 토큰을 받아서 URL 뒤에 붙여서 보냅니다.
      window.location.href = `https://game-frontend-dkbs.onrender.com/?token=${token}`;
      
    } catch (error) {
      console.error("로그인 에러:", error);
      alert("로그인 실패: 아이디나 비밀번호를 확인해주세요.");
    }
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="screen">
      <div className="wrap">
        <img
          src="/login.png"
          alt="center-img"
          className="login-img"
        />

        <input
          type="email"
          placeholder="ID (이메일)"
          className="input-box input1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="PASSWORD"
          className="input-box input2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* 로그인 버튼 */}
        <button className="btn btn1" onClick={handleLogin}>
        </button>

        {/* 회원가입 버튼 */}
        <button className="btn btn2" onClick={handleSignUp}>
        </button>
      </div>
    </div>
  );
}

export default App;
