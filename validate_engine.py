import pandas as pd
import numpy as np

# Load data
file_path = r'C:\Users\dali\Desktop\Freelance Platform Projects.csv'
df = pd.read_csv(file_path)

experience_map = {
    'Entry ($)': 1,
    'Intermediate ($$)': 2,
    'Expert ($$$)': 3
}

def calculate_recommendations(freelancer_profile, projects_df):
    results = projects_df.copy()
    
    # 1. Category Similarity (50%)
    results['category_score'] = (results['Category Name'] == freelancer_profile['category']).astype(float) * 0.5
    
    # 2. Experience Compatibility (30%)
    freelancer_exp_val = experience_map.get(freelancer_profile['experience_level'], 1)
    
    def get_exp_score(row_exp):
        proj_exp_val = experience_map.get(row_exp, 1)
        diff = abs(freelancer_exp_val - proj_exp_val)
        if diff == 0: return 1.0
        if diff == 1: return 0.7
        return 0.3
    
    results['experience_score'] = results['Experience'].apply(get_exp_score) * 0.3
    
    # 3. Budget Fit (20%)
    target_budget = freelancer_profile['min_budget']
    results['budget_score'] = results['Budget'].apply(lambda x: min(1.0, x / target_budget) if target_budget > 0 else 1.0) * 0.2
    
    # Total Score
    results['total_score'] = results['category_score'] + results['experience_score'] + results['budget_score']
    
    return results.sort_values(by='total_score', ascending=False)

# Test logic
test_freelancer = {
    'category': 'Design',
    'experience_level': 'Intermediate ($$)',
    'min_budget': 50.0
}

recs = calculate_recommendations(test_freelancer, df)
top_5 = recs.head(5)

print(f"Top 5 Recommendations for {test_freelancer['category']}:")
for i, row in top_5.iterrows():
    print(f"- {row['Title']} | Score: {row['total_score']:.2f} | Cat: {row['Category Name']} | Exp: {row['Experience']} | Budget: {row['Budget']}")
