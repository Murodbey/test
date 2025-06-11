import React from 'react';

function FamilyMemberCard({ member }) {
  return (
    <div className="family-member-card">
      {member.photo && ( // Conditionally render image if photo exists
        <img src={member.photo} alt={`${member.name}'s Photo`} style={{ maxWidth: '100px', height: 'auto' }} />
      )}
      <h3>{member.name}</h3>
      <p>DOB: {member.dob}</p>
      <p>Gender: {member.gender}</p>
      {/* You can add more details here as needed */}
    </div>
  );
}

export default FamilyMemberCard;