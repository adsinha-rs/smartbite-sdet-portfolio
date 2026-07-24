import { useState, useEffect } from 'react';
import './App.css'; 

function App() {
  const [mealPlan, setMealPlan] = useState(null);
  const [groceryList, setGroceryList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Recipe Form State
  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeCategory, setRecipeCategory] = useState('Breakfast');
  const [addStatus, setAddStatus] = useState('');
  
  // NEW: Dynamic Array State for Ingredients
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: 'g' }]);

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
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  // Handlers for the dynamic ingredients list
  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...ingredients];
    // Convert quantity to a number if that field is being updated
    updatedIngredients[index][field] = field === 'quantity' ? Number(value) : value;
    setIngredients(updatedIngredients);
  };

  const addIngredientRow = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: 'g' }]);
  };

  const removeIngredientRow = (index) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault(); 
    setAddStatus('Saving...');

    // Filter out any blank rows before sending to the backend
    const validIngredients = ingredients.filter(ing => ing.name.trim() !== '' && ing.quantity > 0);

    const newRecipe = {
      title: recipeTitle,
      category: recipeCategory,
      ingredients: validIngredients 
    };

    try {
      const response = await fetch('http://localhost:5000/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecipe),
      });

      if (response.status === 201) {
        setAddStatus('✅ Recipe Added Successfully!');
        setRecipeTitle(''); 
        setIngredients([{ name: '', quantity: '', unit: 'g' }]); // Reset form
      } else {
        setAddStatus('❌ Failed to add recipe.');
      }
    } catch (error) {
      console.error('Error POSTing recipe:', error);
      setAddStatus('❌ Server Error.');
    }
  };

  if (loading) return <div className="App"><h2>Loading your meals... ⏳</h2></div>;
  if (!mealPlan) return <div className="App"><h2>No meal plan found!</h2></div>;

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>SmartBite Dashboard 🥗</h1>
      <h2>Week of: {mealPlan.weekStartDate}</h2>
      
      <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
        <div className="meal-container" style={{ flex: 1 }}>
          <h3>Your Meals</h3>
          {mealPlan.meals.map((meal, index) => (
            <div key={index} className="meal-card" style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
              <h4>{meal.type} - {meal.time}</h4>
              <p><strong>Recipe:</strong> {meal.recipeId.title}</p>
            </div>
          ))}
        </div>

        <div className="grocery-container" style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
          <h3>Smart Shopping List 🛒</h3>
          <ul>
            {groceryList.map((item, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>
                <strong>{item.quantity} {item.unit}</strong> {item.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ========================================== */}
      {/* DYNAMIC RECIPE FORM SECTION                */}
      {/* ========================================== */}
      <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
        <h3>Add a New Recipe</h3>
        
        <form onSubmit={handleAddRecipe} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Recipe Title (e.g., Mass Gainer Shake)" 
              value={recipeTitle}
              onChange={(e) => setRecipeTitle(e.target.value)}
              required
              style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <select 
              value={recipeCategory} 
              onChange={(e) => setRecipeCategory(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>

          {/* DYNAMIC INGREDIENT ROWS */}
          <div style={{ backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
            <h4 style={{ marginTop: 0 }}>Ingredients</h4>
            
            {ingredients.map((ing, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="Name (e.g., Whey Protein)" 
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  required
                  style={{ padding: '8px', flex: 2, borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input 
                  type="number" 
                  placeholder="Qty" 
                  value={ing.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                  required
                  min="0.1"
                  step="0.1"
                  style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <select 
                  value={ing.unit} 
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="scoop">scoop</option>
                  <option value="tbsp">tbsp</option>
                  <option value="cup">cup</option>
                  <option value="piece">piece</option>
                </select>
                
                {/* Only show the delete button if there is more than 1 row */}
                {ingredients.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeIngredientRow(index)}
                    style={{ padding: '8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={addIngredientRow}
              style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}
            >
              + Add Ingredient
            </button>
          </div>

          <button type="submit" style={{ padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1em', fontWeight: 'bold' }}>
            Save Recipe
          </button>
        </form>

        {addStatus && <p style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '1.1em' }}>{addStatus}</p>}
      </div>
    </div>
  );
}

export default App;