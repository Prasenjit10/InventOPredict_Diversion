import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import About from './pages/About';
import Feedback from './pages/Feedback';
import Footer from './components/Footer';
import Register from './pages/Register';
import Login from './pages/Login';
import Contact from './pages/Contact';
import ScrollToTop from './components/ScrollToTop';
import ChatBot from './components/ChatBot';
import AnalysisResult from './pages/AnalysisResult';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Navbar always at top */}
        <ScrollToTop/>
        <Navbar />

        {/* Page content fills remaining space */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/about" element={<About />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contactus" element={<Contact />} />
            <Route path="/analysisresult" element={<AnalysisResult/>} />

          </Routes>
        </main>

        {/* Footer always at bottom */}
        <Footer />


        <ChatBot/>
      </div>
    </Router>
  );
}

export default App;
