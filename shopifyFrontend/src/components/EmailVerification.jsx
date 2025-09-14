import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader, Mail } from "lucide-react";
import axios from "axios";

const EmailVerification = () => {
  const [status, setStatus] = useState("input"); // input, verifying, success, error
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check if email is passed via URL parameter (from signup)
  React.useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!email || !verificationCode) {
      setMessage("Please enter both email and verification code");
      setStatus("error");
      return;
    }

    setStatus("verifying");
    setMessage("");

    try {
      const response = await axios.post("/api/auth/verify-code", {
        email,
        code: verificationCode
      });
      
      setStatus("success");
      setMessage(response.data.message || "Email verified successfully!");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setStatus("error");
      setMessage(error.response?.data?.error || "Email verification failed. Please try again.");
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "input":
        return <Mail className="h-16 w-16 text-indigo-500" />;
      case "verifying":
        return <Loader className="h-16 w-16 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case "error":
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "input":
        return "text-indigo-600";
      case "verifying":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="flex justify-center mb-6">
          {getStatusIcon()}
        </div>
        
        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {status === "input" && "Verify Your Email"}
          {status === "verifying" && "Verifying Email..."}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
        </h1>
        
        {status === "input" && (
          <p className="text-gray-600 mb-6">
            Enter the 6-digit verification code sent to your email address.
          </p>
        )}
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {status === "input" && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Verification Code
              </label>
              <input
                type="text"
                required
                maxLength="6"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-2xl tracking-widest"
                placeholder="000000"
              />
              <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code from your email</p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Verify Email
            </button>
          </form>
        )}
        
        {status === "success" && (
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to login page in 3 seconds...
          </p>
        )}
        <br />
        <div className="space-y-3">
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Go to Login
          </button>
          
          {status === "error" && (
            <button
              onClick={() => {
                setStatus("input");
                setMessage("");
                setVerificationCode("");
              }}
              className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition duration-200"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
