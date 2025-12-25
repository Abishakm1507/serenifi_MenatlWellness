import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';

// Existing styled components remain the same until PlanItem
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
`;

const Sidebar = styled.div`
  width: 240px;
  background-color: white;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e2e8f0;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 2rem;
  img {
    width: 40px;
    height: 40px;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Greeting = styled.div`
  h1 {
    font-size: 1.5rem;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }
`;

const DayStreak = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: white;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  div {
    text-align: center;
  }

  h2 {
    font-size: 1.5rem;
    color: #2d3748;
    margin-bottom: 0.25rem;
  }

  p {
    color: #4a5568;
    font-size: 0.875rem;
  }

  span {
    font-size: 1.5rem;
  }
`;

const MoodTracker = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const EmoticonContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Emoticon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
  background-color: ${props => props.selected ? '#e2e8f0' : 'transparent'};

  &:hover {
    background-color: #e2e8f0;
  }

  span {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: #4a5568;
    font-size: 0.875rem;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3182ce;
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const Notification = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 2rem;
  background-color: #48bb78;
  color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const PlansList = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 1.25rem;
    color: #2d3748;
    margin-bottom: 1rem;
  }
`;

const PlanItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
  background-color: ${props => props.completed ? '#f7fafc' : 'white'};
  border: 1px solid #e2e8f0;
  margin-bottom: 0.5rem;

  &:hover {
    background-color: #f7fafc;
  }

  span {
    font-size: 1.5rem;
  }

  .plan-content {
    flex: 1;
  }

  .plan-title {
    color: #2d3748;
    margin-bottom: 0.25rem;
  }

  .plan-duration {
    color: #4a5568;
    font-size: 0.875rem;
  }

  .completion-indicator {
    font-size: 1rem;
  }
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMood, setSelectedMood] = useState(null);
  const [streak, setStreak] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const incrementStreakIfNotToday = () => {
    try {
      const today = getTodayString();
      const lastMoodDate = localStorage.getItem('lastMoodDate');
      let storedStreak = parseInt(localStorage.getItem('streak') || '0', 10) || 0;

      if (lastMoodDate !== today) {
        storedStreak = storedStreak + 1;
        localStorage.setItem('streak', String(storedStreak));
        localStorage.setItem('lastMoodDate', today);
        setStreak(storedStreak);
        return true;
      }
    } catch (e) {
      // ignore storage errors
    }
    return false;
  };

  const moods = [
    { emoji: '😊', text: 'Happy' },
    { emoji: '😌', text: 'Sad' },
    { emoji: '😠', text: 'Angry' },
    { emoji: '😔', text: 'Relaxed' },
    { emoji: '😃', text: 'Excited' },
    { emoji: '😐', text: 'Neutral' }
  ];

  const plans = [
    { icon: '🧘‍♀️', text: 'Meditation', duration: '20 min' },
    { icon: '📝', text: 'Journaling', duration: 'Write about your day' },
    { icon: '🏃‍♂️', text: 'Exercise', duration: '30 min' },
    { icon: '🎵', text: 'Music', duration: '15 min' },
    { icon: '🙏', text: 'Gratitude Reflection', duration: 'List 3 things you\'re grateful for' },
    { icon: '📱', text: 'Digital Detox', duration: '30 min' }
  ];

  useEffect(() => {
    if (completedTasks.length === plans.length && plans.length > 0) {
      // reuse the same once-per-day guard so streak won't increment twice
      incrementStreakIfNotToday();
    }
  }, [completedTasks, plans.length]);

  // initialize streak from localStorage
  useEffect(() => {
    try {
      const stored = parseInt(localStorage.getItem('streak') || '0', 10) || 0;
      setStreak(stored);
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleTask = (index) => {
    setCompletedTasks(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleLogout = () => {
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleMoodSubmit = () => {
    if (selectedMood !== null) {
      // increment streak at most once per day when user submits mood
      incrementStreakIfNotToday();

      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      // Reset selected mood after submission
      setSelectedMood(null);
    }
  };

  return (
    <Container>
      {showNotification && (
        <Notification>
          Mood submitted successfully! 🎉
        </Notification>
      )}
      <MainContent>
        <Header>
          <Greeting>
            <h1>Hello, Lily!</h1>
            <p>How are you feeling right now?</p>
          </Greeting>
          <DayStreak>
            <div>
              <h2>{streak}</h2>
              <p>Day Streak</p>
            </div>
            <span>🔥</span>
          </DayStreak>
        </Header>

        <MoodTracker>
          <EmoticonContainer>
            {moods.map((mood, index) => (
              <Emoticon
                key={index}
                selected={selectedMood === index}
                onClick={() => setSelectedMood(index)}
              >
                <span>{mood.emoji}</span>
                <p>{mood.text}</p>
              </Emoticon>
            ))}
          </EmoticonContainer>
          <SubmitButton 
            onClick={handleMoodSubmit}
            disabled={selectedMood === null}
          >
            Submit
          </SubmitButton>
        </MoodTracker>

        <PlansList>
          <h2>Your plans for today ({completedTasks.length}/{plans.length})</h2>
          {plans.map((plan, index) => (
            <PlanItem
              key={index}
              completed={completedTasks.includes(index)}
              onClick={() => toggleTask(index)}
            >
              <span>{plan.icon}</span>
              <div className="plan-content">
                <div className="plan-title">{plan.text}</div>
                <div className="plan-duration">{plan.duration}</div>
              </div>
              <span className="completion-indicator">
                {completedTasks.includes(index) ? '✅' : '⭕'}
              </span>
            </PlanItem>
          ))}
        </PlansList>
      </MainContent>
    </Container>
  );
};

export default Dashboard;