import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, ArrowRight, Sparkles, LoaderCircle, CheckCircle, Lightbulb, HelpCircle, User, Star, ClipboardList, MessageSquareQuote } from 'lucide-react';

// --- DATA ---
// This section contains the products, flows, and questions for the tool.
// Questions are now nested under roles to provide tailored practice.
const productData = {
  'Swiggy': {
    icon: '🍔',
    description: 'Food Delivery & More',
    flows: {
      'Searching for a Restaurant': {
        'Entry Level PM': [
          { question: "Open Swiggy. What's the very first thing you see on the home screen? What do you think is the primary goal for the user here?", placeholder: "Focus on the user's immediate needs. What problem are they trying to solve right away?" },
          { question: "Tap the main search bar. What happens? Describe the elements that appear and why they are useful for the user.", placeholder: "Think about reducing user effort. How does this design help someone find what they want faster?" },
          { question: "Type 'pizza' and look at the results. What key information is shown for each restaurant? Is it easy to compare them?", placeholder: "Analyze the information hierarchy. What are the most important details for making a quick decision?" },
          { question: "Find the filter options. What's one filter you would add to help a user on a tight budget? Justify your choice.", placeholder: "Consider a specific user persona. How can you make the experience better for them?" }
        ],
        'Mid-Level PM': [
            { question: "On the home screen, how does Swiggy encourage users to explore beyond their usual orders? What are the trade-offs of this approach?", placeholder: "Consider the balance between discovery and efficiency. Does it ever get in the user's way?" },
            { question: "When you search, the app shows 'Recent Searches' and 'Trending'. Why show both? What user problem does each one solve?", placeholder: "Think about different user intents. A user who knows what they want vs. one looking for inspiration." },
            { question: "Analyze the information density on the search results page. What's one piece of information you would REMOVE to make it less cluttered, and what's the potential downside?", placeholder: "This is about trade-offs. Improving one aspect (clarity) might hurt another (information richness)." },
            { question: "How would you measure the success of the 'Filter' feature? Propose one primary success metric and a counter-metric.", placeholder: "Think about user behavior. How do you know if a feature is actually helping users and not causing problems?" }
        ],
        'Senior PM': [
          { question: "Analyze Swiggy's home screen. What is the overarching business objective reflected in its layout? How does it balance user acquisition, retention, and monetization?", placeholder: "Think about the business strategy. How does the UI serve long-term goals beyond just placing one order?" },
          { question: "Evaluate the search interaction. What trade-offs were likely made between showing personalized suggestions vs. popular/trending items? What data signals would you use to power this?", placeholder: "Consider the technical and product trade-offs. What are the pros and cons of different personalization strategies?" },
          { question: "Assess the search results page from a platform perspective. How does the ranking algorithm seem to work? What are the potential impacts on restaurant partners (e.g., discoverability for new vs. established players)?", placeholder: "Think about the entire ecosystem. How do design choices affect all parties, not just the end-user?" },
          { question: "Critique the filter and sort functionality. How would you evolve this feature to support 'group ordering' use cases more effectively? What new complexities would that introduce?", placeholder: "Think about future product evolution and new user segments. How can the current feature set be a foundation for future growth?" }
        ]
      }
    }
  },
  'Spotify': {
    icon: '🎵',
    description: 'Music & Podcasts',
    flows: {
      'Discovering New Music': {
        'Entry Level PM': [
            { question: "On the Spotify home screen, what are the top 3 things you see that help you find new music?", placeholder: "Identify the most prominent UI elements designed for discovery." },
            { question: "Go to a playlist like 'Discover Weekly'. Why do you think Spotify includes some songs you already know or like in this playlist?", placeholder: "Think about user psychology. How does familiarity build trust in recommendations?" },
            { question: "Use the 'Song Radio' feature. How is this different from a regular playlist? When would a user choose one over the other?", placeholder: "Focus on the user's context and intent. What specific need does each feature fulfill?" }
        ],
        'Mid-Level PM': [
            { question: "How does the home screen balance personalized content ('Made for You') with universal content ('Charts')? What is the benefit of showing both?", placeholder: "Think about user trust and serendipity. How do you cater to personal taste while also showing what's popular?" },
            { question: "A user complains 'Discover Weekly' is repetitive. What are two potential reasons for this, and what's one experiment you would run to fix it?", placeholder: "Formulate a hypothesis. How would you test if your proposed solution actually works?" },
            { question: "How would you measure the success of 'Song Radio'? What user actions would tell you that it's a valuable feature for music discovery?", placeholder: "Define success metrics. What data points would prove the feature is achieving its goal?" }
        ],
        'Senior PM': [
            { question: "Analyze the home screen's content strategy. How does Spotify balance algorithmic recommendations ('Made for You') vs. editorial content (human-curated playlists)? What are the strategic benefits of each?", placeholder: "Consider the long-term engagement and platform differentiation. Why not go 100% algorithmic?" },
            { question: "Evaluate the 'Discover Weekly' feature. What are the key data inputs that make this feature successful? What are the biggest risks or failure modes for this recommendation engine (e.g., filter bubbles)?", placeholder: "Think about the data science and potential negative consequences. How would you measure and mitigate them?" },
            { question: "Critique the 'Song Radio' feature's role in the ecosystem. How does this feature impact artist discovery and royalty payouts? What second-order effects might it have on user listening habits?", placeholder: "Think about the platform's health and its impact on creators. Is it promoting diversity or a 'rich-get-richer' effect?" }
        ]
      }
    }
  }
};

const roles = ['Entry Level PM', 'Mid-Level PM', 'Senior PM'];

// --- API Call Helpers ---

const callGeminiAPI = async (prompt) => {
    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Unexpected API response structure.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
};

const getAIFeedback = async (product, flow, question, answer) => {
  const prompt = `You are an experienced Senior Product Manager coaching an aspiring PM. The user is deconstructing the '${product}' app's '${flow}' flow. The question was: "${question}". The user's answer: "${answer}". Provide concise, constructive feedback. Start by acknowledging a good point. Then, ask a follow-up question to push them deeper on trade-offs, business goals, or user segments. Finally, offer a 'Pro Tip' linking to a PM concept. Use this structure: Good Observation! [Acknowledge] Let's Dig Deeper... 🤔 [Question] Pro Tip 💡 [Concept]`;
  const text = await callGeminiAPI(prompt);
  return text.replace(/Good Observation!/g, '✅ **Good Observation!**')
             .replace(/Let's Dig Deeper... 🤔/g, '\n\n🤔 **Let\'s Dig Deeper...**')
             .replace(/Pro Tip 💡/g, '\n\n💡 **Pro Tip**');
};

const getAISummary = async (product, flow, role, answers) => {
    const answeredQuestions = answers.map((a, i) => `Q${i+1}: ${productData[product].flows[flow][role][i].question}\nA${i+1}: ${a}`).join('\n\n');
    const prompt = `You are a Senior PM evaluating a candidate's product sense based on their answers during a product critique exercise. The candidate is targeting a '${role}' position. They analyzed the '${product}' app's '${flow}' flow. Here are their answers:\n\n${answeredQuestions}\n\nProvide a summary of their performance. Start with an overall assessment (e.g., "Shows strong potential," "Good foundational thinking"). Then, list one specific strength they demonstrated and one area for improvement with a concrete suggestion. Keep it encouraging and constructive.`;
    return callGeminiAPI(prompt);
};


// --- Components ---

const LandingPage = ({ onStart }) => (
    <div className="py-12">
        <div className="text-center">
            <BrainCircuit className="mx-auto h-16 w-16 text-indigo-600" />
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Welcome to the Product Sense Gym</h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">Deconstruct real-world apps, answer targeted questions, and get AI-powered feedback to sharpen your product thinking and land your dream PM job.</p>
            <div className="mt-10">
                <button onClick={onStart} className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    Start Practicing Now
                </button>
            </div>
        </div>

        <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">How It Works</h2>
            <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 text-left sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                    <div className="rounded-xl bg-indigo-100 p-3 ring-1 ring-indigo-200">
                        <ClipboardList className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">1. Select Your Focus</h3>
                    <p className="mt-1 text-sm text-gray-600">Choose a real-world product and the PM role you're targeting.</p>
                </div>
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                    <div className="rounded-xl bg-indigo-100 p-3 ring-1 ring-indigo-200">
                        <MessageSquareQuote className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">2. Deconstruct a Flow</h3>
                    <p className="mt-1 text-sm text-gray-600">Analyze a specific user journey with role-based questions.</p>
                </div>
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                    <div className="rounded-xl bg-indigo-100 p-3 ring-1 ring-indigo-200">
                        <Sparkles className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">3. Get AI Feedback</h3>
                    <p className="mt-1 text-sm text-gray-600">Receive instant, expert feedback on each of your answers.</p>
                </div>
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                    <div className="rounded-xl bg-indigo-100 p-3 ring-1 ring-indigo-200">
                        <Star className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">4. Review Your Summary</h3>
                    <p className="mt-1 text-sm text-gray-600">Get a final performance review to identify strengths and weaknesses.</p>
                </div>
            </div>
        </div>
    </div>
);

const ProductAndRoleSelection = ({ onSelect, onBack }) => {
    const [product, setProduct] = useState(null);
    const [role, setRole] = useState(null);

    // Define the full class strings as constants
    const productButtonBase = "p-6 rounded-xl border-2 transition-all";
    const productButtonActive = "border-indigo-600 bg-indigo-50 shadow-md";
    const productButtonInactive = "border-gray-200 bg-white hover:border-indigo-300";

    const roleButtonBase = "px-5 py-3 rounded-lg border-2 text-base font-semibold transition-all w-full sm:w-auto";
    const roleButtonActive = "border-indigo-600 bg-indigo-50 shadow-md";
    const roleButtonInactive = "border-gray-200 bg-white hover:border-indigo-300";

    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Let's Get Started</h1>
            <p className="mt-2 text-lg text-gray-600">First, choose a product to analyze.</p>
            
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(productData).map(([name, { icon }]) => (
                    <button 
                        key={name} 
                        onClick={() => setProduct(name)} 
                        // Apply the classes based on the condition
                        className={`${productButtonBase} ${product === name ? productButtonActive : productButtonInactive}`}
                    >
                        <span className="text-5xl">{icon}</span>
                        <h3 className="mt-2 text-lg font-semibold text-gray-900">{name}</h3>
                    </button>
                ))}
            </div>

            {product && (
                <div className="mt-10">
                    <h2 className="text-2xl font-bold text-gray-900">Which role are you targeting?</h2>
                    <p className="mt-1 text-gray-600">This will tailor the questions to the right level of strategic depth.</p>
                    <div className="mt-6 flex flex-col sm:flex-row flex-wrap justify-center gap-4">
                        {roles.map(r => (
                            <button 
                                key={r} 
                                onClick={() => setRole(r)} 
                                // Apply the classes based on the condition
                                className={`${roleButtonBase} ${role === r ? roleButtonActive : roleButtonInactive}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {product && role && (
                 <div className="mt-12">
                    <button onClick={() => onSelect(product, role)} className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 flex items-center gap-2 mx-auto">
                        Next: Choose a Flow <ArrowRight/>
                    </button>
                </div>
            )}
            <button onClick={onBack} className="mt-8 text-sm font-semibold text-gray-600 hover:text-gray-500">
                &larr; Back to Home
            </button>
        </div>
    );
};

const FlowSelection = ({ product, role, onSelect, onBack }) => (
  <div className="text-center">
    <div className="text-6xl">{productData[product].icon}</div>
    <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Deconstruct {product}</h1>
    <p className="mt-2 text-lg leading-8 text-gray-600">You're practicing as a <span className="font-semibold text-indigo-600">{role}</span>. Select a user flow.</p>
    <div className="mt-10 space-y-4 max-w-lg mx-auto">
      {Object.keys(productData[product].flows).map(flowName => (
        <button key={flowName} onClick={() => onSelect(flowName)} className="group flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="text-lg font-medium text-gray-800">{flowName}</span>
          <ArrowRight className="h-6 w-6 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500" />
        </button>
      ))}
    </div>
    <button onClick={onBack} className="mt-8 text-sm font-semibold text-indigo-600 hover:text-indigo-500">
      &larr; Back to Product & Role Selection
    </button>
  </div>
);

const CritiqueView = ({ product, flow, role, onComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [allAnswers, setAllAnswers] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const questions = productData[product].flows[flow][role];
  const currentQuestion = questions[currentQuestionIndex];
  
  const feedbackRef = useRef(null);

  useEffect(() => {
    if (feedback && feedbackRef.current) {
        feedbackRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }
  }, [feedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    setIsLoadingFeedback(true);
    setFeedback('');
    try {
        const aiFeedback = await getAIFeedback(product, flow, currentQuestion.question, userAnswer);
        setFeedback(aiFeedback);
        setAllAnswers([...allAnswers, userAnswer]);
    } catch (error) {
        setFeedback("Sorry, an error occurred while getting feedback.");
    } finally {
        setIsLoadingFeedback(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setFeedback('');
    } else {
      onComplete(allAnswers);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <button onClick={onBack} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 mb-4">
            &larr; Back to Flow Selection
        </button>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{productData[product].icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{flow}</h1>
            <p className="text-gray-500">Role: <span className="font-semibold text-indigo-600">{role}</span></p>
          </div>
        </div>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5"><div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div></div>
        <p className="text-right text-sm text-gray-500 mt-1">Step {currentQuestionIndex + 1} of {questions.length}</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <form onSubmit={handleSubmit}>
          <label htmlFor="user-answer" className="block text-lg font-semibold leading-6 text-gray-900">{currentQuestion.question}</label>
          <p className="mt-1 text-sm text-gray-500">Hold your phone, use the real app, and type your observations here.</p>
          <div className="mt-4">
            <textarea id="user-answer" rows={6} value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder={currentQuestion.placeholder} className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" disabled={isLoadingFeedback || !!feedback}/>
          </div>
          <div className="mt-6">
            <button type="submit" disabled={isLoadingFeedback || !userAnswer.trim() || !!feedback} className="flex items-center justify-center w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isLoadingFeedback && <LoaderCircle className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
              {isLoadingFeedback ? 'Getting Feedback...' : 'Submit for Feedback'}
            </button>
          </div>
        </form>

        {feedback && (
          <div ref={feedbackRef} className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3"><Sparkles className="h-6 w-6 text-indigo-500" /><h3 className="text-xl font-bold text-gray-900">AI Feedback</h3></div>
            <div className="mt-4 prose prose-indigo max-w-none text-gray-700">
              {feedback.split('\n\n').map((paragraph, index) => (<p key={index}>{paragraph.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</p>))}
            </div>
            <button onClick={handleNext} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500">
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish & Get Summary'} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryView = ({ product, flow, role, answers, onReset, onBackToFlows }) => {
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setIsLoading(true);
            try {
                const aiSummary = await getAISummary(product, flow, role, answers);
                setSummary(aiSummary);
            } catch (error) {
                setSummary("Sorry, an error occurred while generating your performance summary.");
            }
            setIsLoading(false);
        };
        fetchSummary();
    }, [product, flow, role, answers]);

    return (
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">
            <Star className="mx-auto h-16 w-16 text-amber-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Flow Complete! Here's Your Summary</h2>
            <p className="mt-2 text-gray-600">An AI-powered evaluation of your product sense for the {role} role.</p>
            
            <div className="mt-6 text-left p-6 bg-gray-50 rounded-lg border">
                {isLoading ? (
                    <div className="flex justify-center items-center gap-3">
                        <LoaderCircle className="animate-spin h-6 w-6 text-indigo-600" />
                        <span className="text-gray-700">Generating your summary...</span>
                    </div>
                ) : (
                    <p className="text-gray-800 whitespace-pre-wrap">{summary}</p>
                )}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={onBackToFlows} className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    Practice Another Flow
                </button>
                <button onClick={onReset} className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Start Over
                </button>
            </div>
        </div>
    );
};


export default function App() {
  const [screen, setScreen] = useState('landing'); // landing, selection, flowSelection, critique, summary
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [finalAnswers, setFinalAnswers] = useState([]);

  const handleStart = () => {
      setScreen('selection');
  }

  const handleProductAndRoleSelect = (product, role) => {
    setSelectedProduct(product);
    setSelectedRole(role);
    setScreen('flowSelection');
  };

  const handleFlowSelect = (flow) => {
    setSelectedFlow(flow);
    setScreen('critique');
  };
  
  const handleCritiqueComplete = (answers) => {
      setFinalAnswers(answers);
      setScreen('summary');
  }

  const handleBackToLanding = () => {
      setScreen('landing');
  }

  const handleBackToSelection = () => {
    setSelectedProduct(null);
    setSelectedRole(null);
    setSelectedFlow(null);
    setScreen('selection');
  };

  const handleBackToFlowSelection = () => {
      setSelectedFlow(null);
      setScreen('flowSelection');
  }
  
  const handleReset = () => {
      setScreen('selection');
      setSelectedProduct(null);
      setSelectedRole(null);
      setSelectedFlow(null);
      setFinalAnswers([]);
  }

  const renderScreen = () => {
      switch(screen) {
          case 'landing':
              return <LandingPage onStart={handleStart} />
          case 'selection':
              return <ProductAndRoleSelection onSelect={handleProductAndRoleSelect} onBack={handleBackToLanding} />
          case 'flowSelection':
              return <FlowSelection product={selectedProduct} role={selectedRole} onSelect={handleFlowSelect} onBack={handleBackToSelection} />
          case 'critique':
              return <CritiqueView product={selectedProduct} flow={selectedFlow} role={selectedRole} onComplete={handleCritiqueComplete} onBack={handleBackToFlowSelection} />
          case 'summary':
              return <SummaryView product={selectedProduct} flow={selectedFlow} role={selectedRole} answers={finalAnswers} onReset={handleReset} onBackToFlows={handleBackToFlowSelection} />
          default:
              return <LandingPage onStart={handleStart} />
      }
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto">
        {renderScreen()}
      </div>
    </div>
  );
}
