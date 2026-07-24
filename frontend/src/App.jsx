import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [mealPlan, setMealPlan] = useState(null);
  const [groceryList, setGroceryList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeCategory, setRecipeCategory] = useState('Breakfast');
  const [addStatus, setAddStatus] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: 'g' }]);

  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/mealplan').then(res => res.json()),
      fetch('http://localhost:5000/api/grocerylist').then(res => res.json())
    ])
      .then(([mealData, groceryData]) => {
        setMealPlan(mealData);
        setGroceryList(groceryData);
        setLoading(false);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][field] = field === 'quantity' ? Number(value) : value;
    setIngredients(updatedIngredients);
  };

  const addIngredientRow = () => setIngredients([...ingredients, { name: '', quantity: '', unit: 'g' }]);
  const removeIngredientRow = (index) => setIngredients(ingredients.filter((_, i) => i !== index));

  // ==========================================
  // INTERNET API: USDA FoodData Central Fetcher
  // ==========================================
  const autoCalculateMacros = async () => {
    setIsCalculating(true);
    setAddStatus('📡 Fetching data from USDA internet database...');
    
    let totalCals = 0, totalPro = 0, totalCarb = 0, totalFat = 0;

    try {
      for (const ing of ingredients) {
        if (!ing.name || !ing.quantity) continue;

        // Fetch from the live USDA internet database using a public DEMO_KEY
        const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${ing.name}&pageSize=1&api_key=DEMO_KEY`);
        const data = await response.json();

        if (data.foods && data.foods.length > 0) {
          const nutrients = data.foods[0].foodNutrients;
          
          // USDA values are strictly per 100g. 
          // We calculate a multiplier based on your input.
          let multiplier = 1;
          if (ing.unit === 'g' || ing.unit === 'ml') multiplier = ing.quantity / 100;
          if (ing.unit === 'kg') multiplier = (ing.quantity * 1000) / 100;
          if (ing.unit === 'piece') multiplier = (ing.quantity * 50) / 100; // Average piece = 50g
          if (ing.unit === 'scoop') multiplier = (ing.quantity * 30) / 100; // Average scoop = 30g

          // Extract specific macros from the API response
          const getNutrient = (id) => {
            const nut = nutrients.find(n => n.nutrientId === id);
            return nut ? nut.value : 0;
          };

          // USDA IDs: 1008 = Calories, 1003 = Protein, 1005 = Carbs, 1004 = Fat
          totalCals += getNutrient(1008) * multiplier;
          totalPro += getNutrient(1003) * multiplier;
          totalCarb += getNutrient(1005) * multiplier;
          totalFat += getNutrient(1004) * multiplier;
        }
      }

      // Auto-fill the state with rounded numbers
      setCalories(Math.round(totalCals));
      setProtein(Math.round(totalPro));
      setCarbs(Math.round(totalCarb));
      setFats(Math.round(totalFat));
      
      setAddStatus('✅ Macros auto-calculated successfully!');
    } catch (error) {
      console.error("API Error:", error);
      setAddStatus('❌ Failed to fetch from internet. Please enter manually.');
    }
    
    setIsCalculating(false);
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault(); 
    setAddStatus('Saving...');
    const validIngredients = ingredients.filter(ing => ing.name.trim() !== '' && ing.quantity > 0);
    const newRecipe = {
      title: recipeTitle,
      category: recipeCategory,
      ingredients: validIngredients,
      macros: {
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fats: Number(fats)
      }
    };

    try {
      const response = await fetch('http://localhost:5000/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecipe),
      });

      if (response.status === 201) {
        setAddStatus('✅ Recipe Saved to Database!');
        setRecipeTitle(''); setCalories(''); setProtein(''); setCarbs(''); setFats('');
        setIngredients([{ name: '', quantity: '', unit: 'g' }]); 
      }
    } catch (error) {
      setAddStatus('❌ Server Error.');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}><h2>Loading Dashboard... ⏳</h2></div>;

  // ==========================================
  // MODERN AESTHETIC UI 
  // ==========================================
  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    flex: 1
  };

  const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    outline: 'none',
    fontSize: '15px',
    transition: 'border-color 0.2s'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#2c3e50' }}>SmartBite Dashboard 🥗</h1>
        <p style={{ fontSize: '1.2rem', color: '#7f8c8d', margin: 0 }}>Active Week: <strong>{mealPlan?.weekStartDate || 'Loading...'}</strong></p>
      </div>
      
      {/* Top Row: Meals & Grocery List */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', flexWrap: 'wrap' }}>
        
        <div style={cardStyle}>
          <h3 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', marginTop: 0 }}>🍽️ Your Meals</h3>
          {mealPlan?.meals.map((meal, index) => (
            <div key={index} style={{ padding: '15px', marginBottom: '15px', backgroundColor: '#fafafa', borderRadius: '12px', borderLeft: '4px solid #3498db' }}>
              <h4 style={{ margin: '0 0 5px 0' }}>{meal.type} <span style={{ color: '#95a5a6', fontSize: '0.9em', fontWeight: 'normal' }}>- {meal.time}</span></h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}><strong>{meal.recipeId.title}</strong></p>
              
              {meal.recipeId.macros && (
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.85em', color: '#2c3e50', backgroundColor: '#e8f6f3', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}>
                  <span>🔥 {meal.recipeId.macros.calories} kcal</span>
                  <span style={{ color: '#c0392b' }}>🥩 {meal.recipeId.macros.protein}g P</span>
                  <span style={{ color: '#f39c12' }}>🍚 {meal.recipeId.macros.carbs}g C</span>
                  <span style={{ color: '#f1c40f' }}>🥑 {meal.recipeId.macros.fats}g F</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{...cardStyle, backgroundColor: '#fcfcfc', border: '1px solid #eee' }}>
          <h3 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', marginTop: 0 }}>🛒 Smart Shopping List</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {groceryList.map((item, index) => (
              <li key={index} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: '#e1f5fe', color: '#0288d1', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold' }}>
                  {item.quantity} {item.unit}
                </div>
                <span style={{ fontSize: '1.1em' }}>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom Row: Recipe Builder */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#27ae60' }}>✨ Build New Recipe</h3>
        
        <form onSubmit={handleAddRecipe} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <input type="text" placeholder="Recipe Title (e.g., Anabolic French Toast)" value={recipeTitle} onChange={(e) => setRecipeTitle(e.target.value)} required style={{...inputStyle, flex: 2}} />
            <select value={recipeCategory} onChange={(e) => setRecipeCategory(e.target.value)} style={{...inputStyle, flex: 1, cursor: 'pointer'}}>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>

          {/* DYNAMIC INGREDIENT LIST */}
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, color: '#495057' }}>Ingredients</h4>
              <button type="button" onClick={autoCalculateMacros} disabled={isCalculating} style={{ padding: '10px 15px', backgroundColor: '#8e44ad', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', gap: '5px', alignItems: 'center', transition: 'background-color 0.2s' }}>
                {isCalculating ? '⏳ Fetching...' : '🪄 Auto-Calculate Macros'}
              </button>
            </div>
            
            {ingredients.map((ing, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                <input type="text" placeholder="Name (e.g., Egg, Oats)" value={ing.name} onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} required style={{...inputStyle, flex: 2}} />
                <input type="number" placeholder="Qty" value={ing.quantity} onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)} required min="0.1" step="0.1" style={{...inputStyle, flex: 1}} />
                <select value={ing.unit} onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)} style={{...inputStyle, flex: 1, cursor: 'pointer'}}>
                  <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="scoop">scoop</option><option value="piece">piece</option>
                </select>
                {ingredients.length > 1 && (
                  <button type="button" onClick={() => removeIngredientRow(index)} style={{ padding: '12px', backgroundColor: '#ff7675', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addIngredientRow} style={{ padding: '10px 15px', backgroundColor: '#dfe6e9', color: '#2d3436', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9em', fontWeight: 'bold' }}>+ Add Row</button>
          </div>

          {/* MACROS DISPLAY */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <input type="number" placeholder="Calories" value={calories} onChange={(e) => setCalories(e.target.value)} required style={{...inputStyle, flex: 1, backgroundColor: '#fff9c4'}} title="Calories" />
            <input type="number" placeholder="Protein (g)" value={protein} onChange={(e) => setProtein(e.target.value)} required style={{...inputStyle, flex: 1, backgroundColor: '#ffcdd2'}} title="Protein" />
            <input type="number" placeholder="Carbs (g)" value={carbs} onChange={(e) => setCarbs(e.target.value)} required style={{...inputStyle, flex: 1, backgroundColor: '#ffe0b2'}} title="Carbs" />
            <input type="number" placeholder="Fats (g)" value={fats} onChange={(e) => setFats(e.target.value)} required style={{...inputStyle, flex: 1, backgroundColor: '#c8e6c9'}} title="Fats" />
          </div>

          <button type="submit" style={{ padding: '16px', backgroundImage: 'linear-gradient(to right, #2ecc71, #27ae60)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2em', fontWeight: 'bold', marginTop: '10px', boxShadow: '0 4px 15px rgba(46, 204, 113, 0.3)' }}>
            💾 Save Complete Recipe
          </button>
        </form>
        
        {addStatus && (
          <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', backgroundColor: addStatus.includes('✅') ? '#e8f8f5' : '#fef9e7', color: addStatus.includes('✅') ? '#27ae60' : '#d35400', fontWeight: 'bold', textAlign: 'center' }}>
            {addStatus}
          </div>
        )}
      </div>

    </div>
  );
}

export default App;