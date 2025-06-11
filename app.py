from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)
app.config['SECRET_KEY'] = 'your_secret_key_here'  # Replace with a real secret key

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)


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

        new_member = FamilyMember(user_id=user_id, name=full_name, dob=date_of_birth, location=place_of_birth, gender=gender)
        db.session.add(new_member)
        db.session.commit()

        return redirect(url_for('dashboard'))
    else:
        return render_template('add_family_member.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('dashboard.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)