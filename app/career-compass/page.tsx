"use client";

import { useState, useEffect, useRef } from "react";
import "./career-compass.css";

// Types
interface Answer {
  [key: string]: string | number;
}

interface Question {
  id: string;
  text: string | ((name: string) => string);
  type: "text" | "options";
  key: string;
  options?: string[];
}

interface Company {
  name: string;
  type: string;
  description: string;
  idealFor: string[];
  roles: string[];
}

interface CompanyMatch {
  company: Company;
  score: number;
}

// Company database
const companies: Company[] = [
  {
    name: "TechForGood Inc.",
    type: "Social Impact Tech",
    description: "Building technology solutions for environmental and social challenges",
    idealFor: ["impact", "technology", "innovation", "problem-solving"],
    roles: ["Software Developer", "Product Manager", "UX Designer", "Data Analyst"],
  },
  {
    name: "Creative Studios Co.",
    type: "Design & Media",
    description: "Award-winning creative agency working with brands to tell compelling stories",
    idealFor: ["creative", "design", "storytelling", "collaboration"],
    roles: ["Graphic Designer", "Content Creator", "Art Director", "Brand Strategist"],
  },
  {
    name: "Growth Dynamics",
    type: "Business Consulting",
    description: "Helping startups and scale-ups optimize their operations and growth strategies",
    idealFor: ["business", "strategy", "analysis", "growth"],
    roles: ["Business Analyst", "Strategy Consultant", "Operations Manager"],
  },
  {
    name: "EduTech Innovations",
    type: "Education Technology",
    description: "Revolutionizing learning through accessible, engaging educational platforms",
    idealFor: ["education", "learning", "impact", "technology"],
    roles: ["Learning Experience Designer", "Curriculum Developer", "EdTech Product Manager"],
  },
  {
    name: "HealthFirst Solutions",
    type: "Healthcare Tech",
    description: "Making healthcare more accessible and efficient through digital solutions",
    idealFor: ["healthcare", "impact", "technology", "helping"],
    roles: ["Health Informatics Specialist", "Product Designer", "Clinical Data Analyst"],
  },
  {
    name: "Sustainable Ventures",
    type: "Green Business",
    description: "Building sustainable business solutions for a better planet",
    idealFor: ["environment", "sustainability", "impact", "innovation"],
    roles: ["Sustainability Consultant", "Green Product Developer", "ESG Analyst"],
  },
];

// Questions flow
const questions: Question[] = [
  {
    id: "welcome",
    text: "Hey there! I'm so glad you're here. Finding your path can feel overwhelming, but we'll figure this out together. What should I call you?",
    type: "text",
    key: "name",
  },
  {
    id: "childhood",
    text: (name) =>
      `Nice to meet you, ${name}! Let's start with something fun. When you were younger, what activities made you lose track of time? What did you love doing?`,
    type: "text",
    key: "childhood_passion",
  },
  {
    id: "current_interests",
    text: "That's wonderful! Now, what topics or activities get you excited today? What do you find yourself reading about or watching videos about in your free time?",
    type: "text",
    key: "interests",
  },
  {
    id: "skills",
    text: "Great! Now let's talk about your strengths. What are you naturally good at? (Think about both technical skills and soft skills like communication, problem-solving, creativity, etc.)",
    type: "text",
    key: "skills",
  },
  {
    id: "work_style",
    text: "Here's an important one: How do you prefer to work?",
    type: "options",
    key: "work_style",
    options: [
      "I love working with teams and collaborating",
      "I prefer working independently and autonomously",
      "A mix of both - collaboration and solo time",
      "I thrive in fast-paced, dynamic environments",
    ],
  },
  {
    id: "values",
    text: "What matters most to you in a career?",
    type: "options",
    key: "values",
    options: [
      "Making a positive impact on society",
      "Creative expression and innovation",
      "Financial stability and growth",
      "Continuous learning and personal development",
      "Work-life balance and flexibility",
    ],
  },
  {
    id: "problems",
    text: "What problems in the world frustrate you? What would you love to help solve?",
    type: "text",
    key: "problems",
  },
  {
    id: "education",
    text: "Tell me about your educational background and any relevant experience you have.",
    type: "text",
    key: "education",
  },
  {
    id: "learning",
    text: "Are you open to learning new skills or getting additional training if needed?",
    type: "options",
    key: "learning",
    options: [
      "Absolutely! I love learning new things",
      "Yes, if it's relevant to my goals",
      "Maybe, depends on the time commitment",
      "I prefer to use skills I already have",
    ],
  },
];

export default function CareerCompass() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer>({});
  const [userName, setUserName] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [matches, setMatches] = useState<CompanyMatch[]>([]);
  const [showConnect, setShowConnect] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add initial message
    setMessages([{ sender: "parent", text: questions[0].text as string }]);
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addMessage = (sender: string, text: string) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const handleTextInput = (value: string, key: string) => {
    if (!value.trim()) return;

    if (key === "name") {
      setUserName(value);
    }

    setAnswers((prev) => ({ ...prev, [key]: value }));
    addMessage("user", value);
    proceedToNextQuestion();
  };

  const handleOptionInput = (value: string, index: number, key: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value, [`${key}_index`]: index }));
    addMessage("user", value);
    proceedToNextQuestion();
  };

  const proceedToNextQuestion = () => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const nextIndex = currentQuestion + 1;

      if (nextIndex < questions.length) {
        const nextQuestion = questions[nextIndex];
        const questionText =
          typeof nextQuestion.text === "function"
            ? nextQuestion.text(userName)
            : nextQuestion.text;

        addMessage("parent", questionText);
        setCurrentQuestion(nextIndex);
      } else {
        showResultsScreen();
      }
    }, 1500);
  };

  const analyzeAndMatch = (): CompanyMatch[] => {
    const matchResults: CompanyMatch[] = [];

    const keywords = (
      (answers.childhood_passion || "") +
      " " +
      (answers.interests || "") +
      " " +
      (answers.skills || "") +
      " " +
      (answers.problems || "") +
      " " +
      (answers.values || "")
    ).toLowerCase();

    companies.forEach((company) => {
      let score = 0;

      company.idealFor.forEach((trait) => {
        if (keywords.includes(trait)) {
          score += 2;
        }
      });

      if (answers.work_style && typeof answers.work_style === "string") {
        if (answers.work_style.includes("team") && company.type.includes("Creative")) {
          score += 1;
        }
      }

      if (answers.values && typeof answers.values === "string") {
        if (answers.values.includes("impact") && company.type.includes("Social")) {
          score += 2;
        }
      }

      if (score > 0) {
        matchResults.push({ company, score });
      }
    });

    matchResults.sort((a, b) => b.score - a.score);
    return matchResults.slice(0, 2);
  };

  const showResultsScreen = () => {
    addMessage(
      "parent",
      `${userName}, thank you for sharing all of that with me. I've been thinking about what you've told me, and I have some exciting ideas for you!`
    );

    setTimeout(() => {
      const results = analyzeAndMatch();
      setMatches(results);
      setShowResults(true);
    }, 1500);
  };

  const handleConnect = (companyName: string) => {
    setSelectedCompany(companyName);
    setShowConnect(true);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setUserName("");
    setMessages([{ sender: "parent", text: questions[0].text as string }]);
    setShowResults(false);
    setShowConnect(false);
    setSelectedCompany("");
  };

  if (showConnect) {
    return (
      <div className="container">
        <div className="header">
          <h1>🌟 Career Compass</h1>
          <p>Your journey begins now</p>
        </div>

        <div className="chat-container">
          <div className="result-card">
            <h3>🎉 Wonderful!</h3>
            <p>
              I'm so excited for you, {userName}! I'll connect you with {selectedCompany}.
            </p>
            <p>Here's what happens next:</p>
            <p>
              ✓ Your profile and our conversation will be shared with {selectedCompany}'s
              hiring team
            </p>
            <p>✓ They'll review your background and reach out within 3-5 business days</p>
            <p>✓ You'll receive an email with next steps and interview preparation tips</p>
            <p style={{ marginTop: "20px", fontStyle: "italic" }}>
              Remember: This is just the beginning of your journey. Stay curious, stay open,
              and trust yourself. You've got this! 💪
            </p>
            <button className="connect-btn" onClick={handleRestart}>
              Help Another Person Find Their Path
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🌟 Career Compass</h1>
        <p>Let's discover your perfect career path together</p>
      </div>

      <div className="chat-container" ref={chatContainerRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-bubble">{msg.text}</div>
          </div>
        ))}

        {isTyping && (
          <div className="message parent">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="input-area">
        {!showResults && !isTyping && currentQuestion < questions.length && (
          <InputArea
            question={questions[currentQuestion]}
            onTextSubmit={handleTextInput}
            onOptionSelect={handleOptionInput}
          />
        )}

        {showResults && (
          <div>
            {matches.length > 0 ? (
              matches.map((match, index) => (
                <div key={index} className="result-card" style={{ marginTop: "20px" }}>
                  <h3>✨ Great Match: {match.company.name}</h3>
                  <div className="company-match">
                    <h4>{match.company.type}</h4>
                    <p>{match.company.description}</p>
                    <p>
                      <strong>Potential roles for you:</strong>
                    </p>
                    <p>{match.company.roles.join(", ")}</p>
                  </div>
                  <p>
                    Based on your passion for {answers.interests}, your skills in{" "}
                    {answers.skills}, and your desire to {answers.problems}, I think you'd
                    thrive here!
                  </p>
                  <button
                    className="connect-btn"
                    onClick={() => handleConnect(match.company.name)}
                  >
                    Yes! Connect me with {match.company.name}
                  </button>
                </div>
              ))
            ) : (
              <div className="result-card">
                <h3>Let's Keep Exploring</h3>
                <p>
                  You have such unique interests and skills! While I don't have a perfect
                  company match in my current database, I'd love to help you explore more
                  options.
                </p>
                <p>Based on what you've shared, you might want to look into roles in:</p>
                <p>
                  <strong>Technology, Creative Industries, or Social Impact sectors</strong>
                </p>
                <button className="connect-btn" onClick={handleRestart}>
                  Start Over with New Perspective
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Input Area Component
interface InputAreaProps {
  question: Question;
  onTextSubmit: (value: string, key: string) => void;
  onOptionSelect: (value: string, index: number, key: string) => void;
}

function InputArea({ question, onTextSubmit, onOptionSelect }: InputAreaProps) {
  const [textValue, setTextValue] = useState("");

  const handleSubmit = () => {
    onTextSubmit(textValue, question.key);
    setTextValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (question.type === "text") {
    return (
      <>
        <textarea
          className="text-input"
          placeholder="Type your answer here..."
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="submit-btn" onClick={handleSubmit}>
          Send
        </button>
      </>
    );
  }

  if (question.type === "options" && question.options) {
    return (
      <div className="question-options">
        {question.options.map((option, index) => (
          <button
            key={index}
            className="option-btn"
            onClick={() => onOptionSelect(option, index, question.key)}
          >
            {option}
          </button>
        ))}
      </div>
    );
  }

  return null;
}