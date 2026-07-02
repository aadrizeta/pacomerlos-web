import AnatomiaCard from "@/components/ui/LangingPage/anatomiaCard";

const BANDS = [
  {
    kicker: 'Cobertura',
    word: 'Golosa',
    desc: 'Cargada de crema y tus toppings favoritos',
    bgColor: 'var(--paco-cream)',
    img: '/img/paquito-oreo.png',
    imgAlt: 'Cobertura golosa',
    imgWidth: 1890,
    imgHeight: 744,
    textColor: 'var(--paco-orange)',
  },
  {
    kicker: 'Rellenos',
    word: 'Únicos',
    desc: 'Crema pastelera artesanal',
    bgColor: 'var(--paco-orange)',
    img: '/img/rellenos.png',
    imgAlt: 'Rellenos únicos',
    imgWidth: 1931,
    imgHeight: 702,
    textColor: 'var(--paco-cream)',
  },
  {
    kicker: 'Cuerpo',
    word: 'Nube',
    desc: 'Masa madre fermentada 48 h',
    bgColor: 'var(--paco-purple)',
    img: '/img/masa-nube.png',
    imgAlt: 'Masa madre nube',
    imgWidth: 1713,
    imgHeight: 903,
    textColor: 'var(--paco-cream)',
  },
];
export default function AnatomiaAlt() {
  return (
    <section className="w-full flex flex-col mt-10 lg:mt-20 border-t border-paco-dark/10">
      {BANDS.map((band, i) => (
        <AnatomiaCard
          key={band.word}
          kicker={band.kicker}
          word={band.word}
          desc={band.desc}
          bgColor={band.bgColor}
          img={band.img}
          imgAlt={band.imgAlt}
          imgWidth={band.imgWidth}
          imgHeight={band.imgHeight}
          reverse={i % 2 === 1}
          textColor={band.textColor}
        />
      ))}
    </section>
  );
}