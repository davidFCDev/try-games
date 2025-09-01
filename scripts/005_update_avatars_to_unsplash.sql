-- Actualizar equipos existentes con imágenes de deportistas de Unsplash
UPDATE teams SET avatar_url = CASE 
  WHEN name LIKE '%Alpha%' THEN 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=face'
  WHEN name LIKE '%Beta%' THEN 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=150&h=150&fit=crop&crop=face'
  WHEN name LIKE '%Gamma%' THEN 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=150&h=150&fit=crop&crop=face'
  WHEN name LIKE '%Delta%' THEN 'https://images.unsplash.com/photo-1594736797933-d0301ba541ba?w=150&h=150&fit=crop&crop=face'
  WHEN name LIKE '%Epsilon%' THEN 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=150&h=150&fit=crop&crop=face'
  WHEN name LIKE '%Zeta%' THEN 'https://images.unsplash.com/photo-1520182205497-5d80b4fc0f92?w=150&h=150&fit=crop&crop=face'
  WHEN name LIKE '%Eta%' THEN 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=150&h=150&fit=crop&crop=face'
  WHEN name LIKE '%Theta%' THEN 'https://images.unsplash.com/photo-1615486511262-2bbf8f5401ca?w=150&h=150&fit=crop&crop=face'
  WHEN name LIKE '%Iota%' THEN 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=150&h=150&fit=crop&crop=face'
  WHEN name LIKE '%Kappa%' THEN 'https://images.unsplash.com/photo-1594736797933-d0301ba541ba?w=150&h=150&fit=crop&crop=face'
  WHEN name LIKE '%Spaguetti%' THEN 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=face'
  WHEN name LIKE '%Cardionada%' THEN 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=150&h=150&fit=crop&crop=face'
  ELSE (
    CASE (ABS(HASHTEXT(name)) % 10)
      WHEN 0 THEN 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=face'
      WHEN 1 THEN 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=150&h=150&fit=crop&crop=face'
      WHEN 2 THEN 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=150&h=150&fit=crop&crop=face'
      WHEN 3 THEN 'https://images.unsplash.com/photo-1594736797933-d0301ba541ba?w=150&h=150&fit=crop&crop=face'
      WHEN 4 THEN 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=150&h=150&fit=crop&crop=face'
      WHEN 5 THEN 'https://images.unsplash.com/photo-1520182205497-5d80b4fc0f92?w=150&h=150&fit=crop&crop=face'
      WHEN 6 THEN 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=150&h=150&fit=crop&crop=face'
      WHEN 7 THEN 'https://images.unsplash.com/photo-1615486511262-2bbf8f5401ca?w=150&h=150&fit=crop&crop=face'
      WHEN 8 THEN 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=150&h=150&fit=crop&crop=face'
      ELSE 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=face'
    END
  )
END;
