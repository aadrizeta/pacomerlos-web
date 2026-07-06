import MainFooter from './MainFooter';
import SubFooter from './SubFooter';
import NewsLetterForm from './NewsLetterForm';

export default function Footer() {
  return (
    <footer className="border-t border-black/10">
      <NewsLetterForm />
      <MainFooter />
      <SubFooter />
    </footer>
  );
}
