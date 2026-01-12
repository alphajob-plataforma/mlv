import FreelancerHeader from "@/components/layout/FreelancerHeader/FreelancerHeader";

export default function FreelancerLayout({ children }) {
  return (
    <div style={{ backgroundColor: '#131616', minHeight: '100vh', color: '#fff' }}>
      <FreelancerHeader />
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {children}
      </main>
    </div>
  );
}