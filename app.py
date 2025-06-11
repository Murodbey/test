from flask import Flask, render_template, request, redirect, url_for, session, abort
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

app.config['SECRET_KEY'] = 'your_secret_key_here'  # Replace with a real secret key

app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

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

@app.route('/add_member', methods=['GET', 'POST'])
def add_member():
    if 'user_id' not in session:
        return redirect(url_for('index'))

    if request.method == 'POST':
        user_id = session.get('user_id')
        full_name = request.form['full_name']
        date_of_birth = request.form['date_of_birth']
        place_of_birth = request.form['place_of_birth']
        gender = request.form['gender']
        photo_path = None # Initialize photo_path to None

        if 'photo' in request.files:
            file = request.files['photo']
            if file.filename != '' and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                upload_folder_path = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'])
                os.makedirs(upload_folder_path, exist_ok=True) # Create upload folder if it doesn't exist
                file_path = os.path.join(upload_folder_path, filename)
                file.save(file_path)
                photo_path = os.path.join('/', app.config['UPLOAD_FOLDER'], filename) # Store path relative to static

        date_of_death = request.form.get('dod') # Use .get() for optional fields

        new_member = FamilyMember(user_id=user_id, name=full_name, dob=date_of_birth, location=place_of_birth, gender=gender, photo=photo_path, dod=date_of_death)
        db.session.add(new_member)

        db.session.commit()

        return redirect(url_for('dashboard'))
    else:
        return render_template('add_family_member.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('index'))

    user_id = session.get('user_id')

    # Fetch all family members and relationships for the logged-in user
    family_members = FamilyMember.query.filter_by(user_id=user_id).all()
    relationships = Relationship.query.filter_by(user_id=user_id).all()

    return render_template('dashboard.html', family_members=family_members, relationships=relationships)


@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('index'))

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

    parents = []
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
                    parents.append({'member': other_member, 'relationship_id': relationship.id})
                elif relationship.relationship_type == 'spouse':
                    spouses.append({'member': other_member, 'relationship_id': relationship.id})
                # Add other relationship types as needed

    return render_template('view_member.html', family_member=family_member, relationships=relationships, parents=parents, children=children, spouses=spouses)

@app.route('/profile', methods=['GET'])
def profile():
    if 'user_id' not in session:
        return redirect(url_for('index'))

    user_id = session.get('user_id')
    user = User.query.get(user_id)

    if user:
        return render_template('profile.html', user=user)
    else:
        # This case ideally shouldn't happen if session['user_id'] is set correctly
        return redirect(url_for('dashboard'))


@app.route('/edit_profile', methods=['GET', 'POST'])
def edit_profile():
    if 'user_id' not in session:
        return redirect(url_for('index'))

    user_id = session.get('user_id')
    user = User.query.get(user_id)

    if user:
        if request.method == 'POST':
            user.username = request.form['username']
            user.email = request.form.get('email') # Use .get() for optional fields

            db.session.commit()

            return redirect(url_for('profile'))
        else:
            return render_template('edit_profile.html', user=user)
    else:
        # This case ideally shouldn't happen if session['user_id'] is set correctly
        return redirect(url_for('dashboard'))








@app.route('/edit_member/<int:member_id>', methods=['GET', 'POST'])
def edit_member(member_id):
    if 'user_id' not in session:
        return redirect(url_for('index'))

    user_id = session.get('user_id')
    family_member = FamilyMember.query.filter_by(id=member_id, user_id=user_id).first_or_404()

    if request.method == 'POST':
        # Update the family member's data
        family_member.name = request.form['full_name']
        family_member.dob = request.form['date_of_birth']
        family_member.location = request.form['place_of_birth']
        family_member.gender = request.form['gender']
        family_member.photo = request.form.get('photo') # Use .get() for optional fields
        family_member.dod = request.form.get('dod') # Use .get() for optional fields

        db.session.commit()

        # Redirect to the view member page
        return redirect(url_for('view_member', member_id=family_member.id))
    else:
        return render_template('edit_member.html', family_member=family_member)

@app.route('/delete_member/<int:member_id>', methods=['POST'])
def delete_member(member_id):
    if 'user_id' not in session:
        return redirect(url_for('index'))

    user_id = session.get('user_id')
    family_member = FamilyMember.query.filter_by(id=member_id, user_id=user_id).first_or_404()

    # Ensure the request is a POST request (for security, to prevent accidental deletion via GET link)
    if request.method == 'POST':
        db.session.delete(family_member)
        db.session.commit()
        return redirect(url_for('dashboard'))
    else:
        # Optionally, handle other request methods or return an error
        abort(405) # Method Not Allowed

@app.route('/add_relationship', methods=['GET', 'POST'])
def add_relationship():
    if 'user_id' not in session:
        return redirect(url_for('index'))

    user_id = session.get('user_id')

    family_members = FamilyMember.query.filter_by(user_id=user_id).all()

    if request.method == 'POST':
        print("DEBUG: Inside add_relationship POST block")
        member1_id = int(request.form['member1_id'])
        print(f"Member 1 ID received: {member1_id}")
        member2_id = int(request.form['member2_id'])
        print(f"Member 2 ID received: {member2_id}")
        relationship_type = request.form['relationship_type']
        print(f"Relationship type received: {relationship_type}")

        new_relationship = Relationship(user_id=user_id, member1_id=member1_id, member2_id=member2_id, relationship_type=relationship_type)

        db.session.add(new_relationship)
        print("DEBUG: Relationship added to session")
        try:
            db.session.commit()
            print("DEBUG: Database session committed")
        except Exception as e:
            print(f"DEBUG: Error during database commit: {e}")
            db.session.rollback()

        return redirect(url_for('dashboard'))
    else:
        return render_template('add_relationship.html', family_members=family_members)


@app.route('/edit_relationship/<int:relationship_id>', methods=['GET'])
def edit_relationship(relationship_id):
    if 'user_id' not in session:
        return redirect(url_for('index'))

    user_id = session.get('user_id')
    relationship = Relationship.query.filter_by(id=relationship_id, user_id=user_id).first_or_404()

    family_members = FamilyMember.query.filter_by(user_id=user_id).all()

    return render_template('edit_relationship.html', relationship=relationship, family_members=family_members)

@app.route('/edit_relationship/<int:relationship_id>', methods=['POST'])
def update_relationship(relationship_id):
    if 'user_id' not in session:
        return redirect(url_for('index'))

    user_id = session.get('user_id')
    relationship = Relationship.query.filter_by(id=relationship_id, user_id=user_id).first_or_404()

    relationship.member1_id = int(request.form['member1_id'])
    relationship.member2_id = int(request.form['member2_id'])
    relationship.relationship_type = request.form['relationship_type']

    db.session.commit()

    return redirect(url_for('view_member', member_id=relationship.member1_id))

@app.route('/delete_relationship/<int:relationship_id>', methods=['POST'])
def delete_relationship(relationship_id):
    if 'user_id' not in session:
        return redirect(url_for('index'))

    user_id = session.get('user_id')
    relationship = Relationship.query.filter_by(id=relationship_id, user_id=user_id).first_or_404()

    db.session.delete(relationship)
    db.session.commit()

    return redirect(url_for('dashboard'))

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
