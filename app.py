from flask import Flask, render_template, request, redirect, url_for, session, abort
from flask import jsonify # Import jsonify
from sqlalchemy import or_, inspect
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
db = SQLAlchemy(app)

app.config['SECRET_KEY'] = 'your_secret_key_here'  # Replace with a real secret key

app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

from werkzeug.security import generate_password_hash, check_password_hash
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)


    def __repr__(self):
        return '<User %r>' % self.username

class FamilyMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)    
    photo = db.Column(db.String(200)) # Store path to photo
    dob = db.Column(db.String(20))    
    dod = db.Column(db.String(20))    
    location = db.Column(db.String(100))    
    gender = db.Column(db.String(20), nullable=True)

    user = db.relationship('User', backref=db.backref('family_members', lazy=True))    
    relationships_as_member1 = db.relationship('Relationship', foreign_keys='Relationship.member1_id', backref='member1', lazy='dynamic')
    relationships_as_member2 = db.relationship('Relationship', foreign_keys='Relationship.member2_id', backref='member2', lazy='dynamic')

class Relationship(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    member1_id = db.Column(db.Integer, db.ForeignKey('family_member.id'), nullable=False)
    member2_id = db.Column(db.Integer, db.ForeignKey('family_member.id'), nullable=False)
    relationship_type = db.Column(db.String(50), nullable=False)

    user = db.relationship('User', backref=db.backref('relationships', lazy=True))

    def __repr__(self):
        return f'<Relationship {self.member1_id} - {self.relationship_type} - {self.member2_id}>'
    
    # Add a method to convert Relationship object to a dictionary
    def to_dict(self): 
        return {
            'id': self.id,
            'user_id': self.user_id,
            'member1_id': self.member1_id,
            'member2_id': self.member2_id,
            'relationship_type': self.relationship_type,
        }




# Create the database tables
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():
    username = request.form['username']
    password = request.form['password']
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return redirect(url_for('index'))

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password, password):
        session['user_id'] = user.id
        return redirect(url_for('dashboard'))
    else:
        return redirect(url_for('index'))

@app.route('/api/members', methods=['POST']) # New API endpoint
def add_member():
    if 'user_id' not in session:
        return jsonify({'message': 'Not authenticated'}), 401

    if request.method == 'POST':
        user_id = session['user_id']
        data = request.get_json()
        full_name = data.get('name')
        date_of_birth = data.get('dob')
        place_of_birth = data.get('location')
        gender = data.get('gender')
        date_of_death = data.get('dod')
        photo_path = None # Initialize photo_path to None

        new_member = FamilyMember(user_id=user_id, name=full_name, dob=date_of_birth, location=place_of_birth, gender=gender, photo=photo_path, dod=date_of_death)
        db.session.add(new_member)

        db.session.commit()

        return jsonify({'message': 'Family member added successfully', 'member_id': new_member.id}), 201


@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('index'))

    user_id = session.get('user_id')

    # Fetch all family members and relationships for the logged-in user
    family_members = FamilyMember.query.filter_by(user_id=user_id).all()
    relationships = Relationship.query.filter_by(user_id=user_id).all()
    
    # Convert SQLAlchemy objects to dictionaries for JSON serialization
    family_members_data = [{
        'id': member.id,
        'name': member.name,
        'photo': member.photo,
        'dob': member.dob,
        'dod': member.dod,
        'location': member.location,
        'gender': member.gender
    } for member in family_members]
    relationships_data = [relationship.to_dict() for relationship in relationships]

    # If the request is an API request, return JSON
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.is_json:
         family_members_data = [{
            'id': member.id,
            'name': member.name,
            'photo': member.photo,
            'dob': member.dob,
            'dod': member.dod,
            'location': member.location,
            'gender': member.gender
        } for member in family_members]
         return jsonify(family_members=family_members_data, relationships=relationships_data)

    return jsonify(family_members=family_members_data, relationships=relationships_data)
@app.route('/logout')
def logout():
 session.pop('user_id', None)
 return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/member/<int:member_id>')
def view_member(member_id):
    if 'user_id' not in session:
        return redirect(url_for('index'))

    user_id = session.get('user_id')
    # Query for relationships where the member is either member1 or member2
    family_member = FamilyMember.query.filter_by(id=member_id, user_id=user_id).first_or_404()
 relationships = Relationship.query.filter(
        ((Relationship.member1_id == member_id) | (Relationship.member2_id == member_id)),
        Relationship.user_id == user_id
    ).all()

    mothers = [] 
    fathers = [] 
    siblings = [] # List to store sibling members and their relationship IDs
    children = []
    spouses = []

    # Populate parents, children, and spouses lists based on relationships
    for relationship in relationships:
        if relationship.member1_id == member_id:
 other_member = FamilyMember.query.get(relationship.member2_id)
 if other_member:
 if relationship.relationship_type.lower() == 'child':
 children.append({'member': other_member, 'relationship_id': relationship.id})
 elif relationship.relationship_type.lower() == 'spouse':
 spouses.append({'member': other_member, 'relationship_id': relationship.id})
 # Add other relationship types as needed
        elif relationship.member2_id == member_id:
 other_member = FamilyMember.query.get(relationship.member1_id)
 if other_member:
 if relationship.relationship_type.lower() == 'parent':
 if other_member.gender == 'Female':
 mothers.append({'member': other_member, 'relationship_id': relationship.id})
 elif other_member.gender == 'Male':
 fathers.append({'member': other_member, 'relationship_id': relationship.id})
                elif relationship.relationship_type.lower() == 'spouse':
                    spouses.append({'member': other_member, 'relationship_id': relationship.id})
                # Add other relationship types as needed

    print(f"DEBUG: Data being sent to template - Mothers: {mothers}, Fathers: {fathers}, Children: {children}, Spouses: {spouses}, Siblings: {siblings}")
    
    # If the request is an API request, return JSON
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.is_json:
        return jsonify({
            'id': family_member.id,
            'name': family_member.name,
            'photo': family_member.photo,
            'dob': family_member.dob,
            'dod': family_member.dod,
            'location': family_member.location,
            'gender': family_member.gender,
            'relationships': [relationship.to_dict() for relationship in relationships],
            'mothers': [{'member_id': m['member'].id, 'name': m['member'].name, 'relationship_id': m['relationship_id']} for m in mothers],
            'fathers': [{'member_id': f['member'].id, 'name': f['member'].name, 'relationship_id': f['relationship_id']} for f in fathers],
            'children': [{'member_id': c['member'].id, 'name': c['member'].name, 'relationship_id': c['relationship_id']} for c in children],
            'spouses': [{'member_id': s['member'].id, 'name': s['member'].name, 'relationship_id': s['relationship_id']} for s in spouses],
            'siblings': [{'member_id': s['member'].id, 'name': s['member'].name, 'relationship_id': s['relationship_id']} for s in siblings]
        })

    # Remove this if you are fully migrating to React
    # return render_template('view_member.html', family_member=family_member, relationships=relationships, mothers=mothers, fathers=fathers, children=children, spouses=spouses, siblings=siblings)

@app.route('/api/profile', methods=['GET'])
def profile():
    if 'user_id' not in session:
        return jsonify({'message': 'Not authenticated'}), 401

    user_id = session.get('user_id')
    user = User.query.get(user_id)

    if user:
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email
        }), 200
    else:
        return jsonify({'message': 'User not found'}), 404

@app.route('/api/profile', methods=['PUT'])
def edit_profile():
    if 'user_id' not in session:
        return jsonify({'message': 'Not authenticated'}), 401

    user_id = session.get('user_id')
    user = User.query.get(user_id)

    if user:
        data = request.json
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)

        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200
    else:
        return jsonify({'message': 'User not found'}), 404

@app.route('/api/members/<int:member_id>', methods=['GET', 'PUT', 'DELETE'])
def member_api(member_id):
    if 'user_id' not in session:
        return redirect(url_for('index'))

    user_id = session['user_id']
    family_member = FamilyMember.query.filter_by(id=member_id, user_id=user_id).first_or_404()

    if request.method == 'GET':
        # Re-use the logic from view_member but return JSON
 return jsonify({
        data = request.json
        family_member.name = data.get('name', family_member.name)
        family_member.dob = data.get('dob', family_member.dob)
        family_member.location = data.get('location', family_member.location)
        family_member.gender = data.get('gender', family_member.gender)
        family_member.dod = data.get('dod', family_member.dod)

        # Handle photo update if needed (requires more complex logic for file uploads via API)
        db.session.commit()
        return jsonify({'message': 'Family member updated successfully'}), 200
    elif request.method == 'PUT':
        data = request.json
        family_member.name = data.get('name', family_member.name)
        family_member.dob = data.get('dob', family_member.dob)
        family_member.location = data.get('location', family_member.location)
        family_member.gender = data.get('gender', family_member.gender)
        family_member.dod = data.get('dod', family_member.dod)

        # Handle photo update if needed (requires more complex logic for file uploads via API)
        db.session.commit()
        return jsonify({'message': 'Family member updated successfully'}), 200

    elif request.method == 'DELETE':
        db.session.delete(family_member)
        db.session.commit()
        return jsonify({'message': 'Family member deleted successfully'}), 200

    else:
        abort(405) # Method Not Allowed

@app.route('/edit_member/<int:member_id>', methods=['GET', 'POST'])
 return "This route is deprecated. Use the API endpoint."

@app.route('/delete_member/<int:member_id>', methods=['POST'])
def delete_member_deprecated(member_id):
    if 'user_id' not in session:
        return redirect(url_for('index'))

@app.route('/add_relationship', methods=['GET', 'POST'])
def add_relationship_deprecated():
 return "This route is deprecated. Use the API endpoint."

@app.route('/api/relationships', methods=['POST'])
def add_relationship():
    if 'user_id' not in session:
        return jsonify({'message': 'Not authenticated'}), 401

    user_id = session.get('user_id')

    data = request.get_json()
    member1_id = data.get('member1_id')
    member2_id = data.get('member2_id')
    relationship_type = data.get('relationship_type')

    if not all([member1_id, member2_id, relationship_type]):
        return jsonify({'message': 'Missing relationship data'}), 400

    new_relationship = Relationship(user_id=user_id, member1_id=member1_id, member2_id=member2_id, relationship_type=relationship_type)

    db.session.add(new_relationship)
    db.session.commit()

    return jsonify({'message': 'Relationship added successfully', 'relationship_id': new_relationship.id}), 201


@app.route('/api/relationships/<int:relationship_id>', methods=['GET', 'PUT', 'DELETE'])
def relationship_api(relationship_id):
    if 'user_id' not in session:
        return jsonify({'message': 'Not authenticated'}), 401

    user_id = session.get('user_id')
    relationship = Relationship.query.filter_by(id=relationship_id, user_id=user_id).first_or_404()

    if request.method == 'GET':
        # Return the relationship data as JSON
        return jsonify(relationship.to_dict()), 200

    elif request.method == 'PUT':
        data = request.json
        relationship.member1_id = data.get('member1_id', relationship.member1_id)
        relationship.member2_id = data.get('member2_id', relationship.member2_id)
        relationship.relationship_type = data.get('relationship_type', relationship.relationship_type)
        db.session.commit()
        return jsonify({'message': 'Relationship updated successfully'}), 200

    elif request.method == 'DELETE':
        db.session.delete(relationship)
        db.session.commit()
        return jsonify({'message': 'Relationship deleted successfully'}), 200
    else:
        abort(405) # Method Not Allowed

    user_id = session.get('user_id')
    relationship = Relationship.query.filter_by(id=relationship_id, user_id=user_id).first_or_404()

    relationship.member1_id = int(request.form['member1_id'])
    relationship.member2_id = int(request.form['member2_id'])
    relationship.relationship_type = request.form['relationship_type']

    db.session.commit()

@app.route('/edit_relationship/<int:relationship_id>', methods=['GET'])
def edit_relationship_deprecated(relationship_id):
    return "This route is deprecated. Use the API endpoint."

@app.route('/delete_relationship/<int:relationship_id>', methods=['POST'])
def delete_relationship_deprecated(relationship_id):
    # Re-use the logic from relationship_api but handle template redirect
    return "This route is deprecated. Use the API endpoint."

@app.route('/search', methods=['GET'])
def search():
    if 'user_id' not in session:
        return redirect(url_for('index'))

    user_id = session.get('user_id')
    search_query = request.args.get('search_query')

    results = []
    if search_query:
        results = FamilyMember.query.filter(FamilyMember.name.ilike(f'%{search_query}%'), FamilyMember.user_id == user_id).all()

    return render_template('search_results.html', results=results, search_query=search_query)


if __name__ == '__main__':
     app.run(debug=True)
