import MenuSection from './MenuSection';

export default function CombosSection({ seconds = 25 * 60 }) {
  return (
    <MenuSection
      category="super-combos"
      title="Super Combos"
      icon="🍕"
      subtitle="Los favoritos de todos · Sabores a elección"
      isSuperCombos={true}
      seconds={seconds}
    />
  );
}
