import { Link, useNavigate } from 'react-router-dom'
import { Heart, Clock, MessageCircle, Users, Shield, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f5f3ef', color: '#1a1a2e' }}>

      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 48px', background: '#f5f3ef'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', fontSize: '16px' }}>
          <div style={{
            width: '28px', height: '28px', background: '#1a1a2e',
            borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Heart size={14} color="white" fill="white" />
          </div>
          Clara
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/login" style={{
            padding: '8px 18px', border: '1.5px solid #1a1a2e', borderRadius: '8px',
            background: 'transparent', fontSize: '13px', color: '#1a1a2e',
            cursor: 'pointer', fontWeight: '500', textDecoration: 'none'
          }}>
            Sign in
          </Link>
          <Link to="/signup" style={{
            padding: '8px 18px', border: '1.5px solid #1a1a2e', borderRadius: '8px',
            background: '#1a1a2e', fontSize: '13px', color: 'white',
            cursor: 'pointer', fontWeight: '500', textDecoration: 'none'
          }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '88vh' }}>

        {/* Left */}
        <div style={{ padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'white', border: '1px solid #e0ddd8', borderRadius: '20px',
            padding: '6px 14px', fontSize: '12px', color: '#888',
            marginBottom: '32px', width: 'fit-content'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4caf7d' }} />
            Designed for dementia care
          </div>

          <h1 style={{
            fontFamily: 'Georgia, serif', fontSize: '52px', lineHeight: '1.15',
            color: '#1a1a2e', marginBottom: '20px', fontWeight: '500'
          }}>
            Your gentle<br />
            <span style={{ fontStyle: 'italic', color: '#888' }}>AI companion</span><br />
            for daily care.
          </h1>

          <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.75', maxWidth: '420px', marginBottom: '40px' }}>
            Clara helps people living with dementia stay safe and connected.
            Reminders, companionship, and caregiver support — all in one simple place.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/signup')}
              style={{
                padding: '13px 28px', background: '#1a1a2e', color: 'white',
                border: 'none', borderRadius: '10px', fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif", fontWeight: '500', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              Start free today
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '13px 24px', background: 'transparent', color: '#888',
                border: 'none', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
                fontWeight: '400', cursor: 'pointer'
              }}
            >
              I already have an account →
            </button>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '20px',
            marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #e8e5e0'
          }}>
            {[
              { icon: <Shield size={13} color="#4caf7d" />, text: 'Secure & private' },
              { icon: <Heart size={13} color="#4caf7d" fill="#4caf7d" />, text: 'Built with care' },
              { icon: <span style={{ fontSize: '13px', color: '#4caf7d' }}>✓</span>, text: 'Free to start' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#999' }}>
                {item.icon} {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{
          background: '#1a1a2e', display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '48px', position: 'relative'
        }}>
          {/* Main card */}
          <div style={{ background: '#f5f3ef', borderRadius: '20px', width: '260px', padding: '24px', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', background: '#1a1a2e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', color: 'white', fontWeight: '500'
              }}>RK</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>Ramesh Kumar</div>
                <div style={{ fontSize: '11px', color: '#999' }}>Patient · Morning routine</div>
              </div>
            </div>

            {[
              { color: '#4caf7d', text: 'Take morning medicine', time: '8:00 AM' },
              { color: '#f5a623', text: 'Drink water — stay hydrated', time: '10:30 AM' },
              { color: '#4caf7d', text: 'Call with family', time: '3:00 PM' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: '10px', padding: '12px 14px',
                marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                <div style={{ fontSize: '12px', color: '#444', flex: 1 }}>{item.text}</div>
                <div style={{ fontSize: '11px', color: '#bbb' }}>{item.time}</div>
              </div>
            ))}
          </div>

          {/* Floating stat card */}
          <div style={{
            background: 'white', borderRadius: '12px', padding: '12px 16px',
            position: 'absolute', bottom: '60px', right: '40px', width: '140px', zIndex: 3
          }}>
            <div style={{ fontSize: '10px', color: '#bbb', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Tasks done
            </div>
            <div style={{ fontSize: '22px', fontWeight: '500', color: '#1a1a2e' }}>8/10</div>
            <div style={{ fontSize: '11px', color: '#4caf7d' }}>Great day today!</div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ padding: '80px 48px', background: '#f5f3ef' }}>
        <div style={{ fontSize: '12px', color: '#999', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
          What Clara does
        </div>
        <h2 style={{
          fontFamily: 'Georgia, serif', fontSize: '36px', color: '#1a1a2e',
          marginBottom: '48px', fontWeight: '500', maxWidth: '400px', lineHeight: '1.3'
        }}>
          Everything you need, nothing you don't.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            {
              icon: <Clock size={20} color="#1a1a2e" />,
              title: 'Smart reminders',
              desc: 'Medicine, meals, and appointments — Clara reminds gently, every time.'
            },
            {
              icon: <MessageCircle size={20} color="#1a1a2e" />,
              title: 'Talk to Clara',
              desc: 'An AI companion always ready to listen, chat, and keep patients company.'
            },
            {
              icon: <Users size={20} color="#1a1a2e" />,
              title: 'Caregiver updates',
              desc: 'Family and caregivers stay informed with daily summaries and alerts.'
            },
          ].map((feat, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: '14px', padding: '28px', border: '1px solid #eee'
            }}>
              <div style={{
                width: '40px', height: '40px', background: '#f5f3ef', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px'
              }}>
                {feat.icon}
              </div>
              <div style={{ fontSize: '15px', fontWeight: '500', color: '#1a1a2e', marginBottom: '8px' }}>
                {feat.title}
              </div>
              <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.6' }}>
                {feat.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div style={{
        background: '#1a1a2e', padding: '60px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <h2 style={{
          fontFamily: 'Georgia, serif', fontSize: '32px', color: 'white',
          fontWeight: '500', maxWidth: '360px', lineHeight: '1.3'
        }}>
          Ready to bring care closer together?
        </h2>
        <button
          onClick={() => navigate('/signup')}
          style={{
            padding: '13px 28px', background: 'white', color: '#1a1a2e',
            border: 'none', borderRadius: '10px', fontSize: '14px',
            fontFamily: "'DM Sans', sans-serif", fontWeight: '500', cursor: 'pointer'
          }}
        >
          Create free account →
        </button>
      </div>

    </div>
  )
}
