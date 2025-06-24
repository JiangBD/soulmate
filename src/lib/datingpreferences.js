import {getDatingPreferences, getUser} from '@/lib/inmemory';

export const areDatingPreferencesMatched = (this_user_id, other_user_id) => {
  //console.log(`This user id: ${this_user_id} , other user id: ${other_user_id}`);
  const this_user_preferences = getDatingPreferences(this_user_id);
  const other_user_preferences = getDatingPreferences(other_user_id);

 // 1) age 
  const this_age_range = this_user_preferences.age_range.split(' - ').map(Number);
  const other_age_range = other_user_preferences.age_range.split(' - ').map(Number);
  const this_year_of_birth = getUser(this_user_id).date_of_birth.split('-')[0];
  const other_year_of_birth = getUser(other_user_id).date_of_birth.split('-')[0];
 // console.log (`this: ${this_year_of_birth} ,other: ${other_year_of_birth}`);


  const this_age = new Date().getFullYear() - Number(this_year_of_birth);
  const other_age = new Date().getFullYear() - Number(other_year_of_birth) ;
 // console.log (`this age: ${this_age} ,other age: ${other_age}`);

  if (this_age < other_age_range[0] || this_age > other_age_range[1]) return false;
  if (other_age < this_age_range[0] || other_age > this_age_range[1]) return false;

 // 2)  this gender === other's gender_preference && other's gender === this gender_preference
  const this_gender = getUser(this_user_id).gender;
  const other_gender = getUser(other_user_id).gender;
 // console.log (`this gender: ${this_gender} ,other gender: ${other_gender}`);

  if ( this_gender !== other_user_preferences.gender_preference ||
     other_gender !== this_user_preferences.gender_preference) 
    return false;

// 3) this marital_status === other's marital_status_preference &&

  const this_marital_status = getUser(this_user_id).marital_status;
  const other_marital_status = getUser(other_user_id).marital_status;
  const this_marital_status_preference = this_user_preferences.marital_status_preference;
  const other_marital_status_preference = other_user_preferences.marital_status_preference;   
  //console.log (`this marital: ${this_marital_status_preference} ,other marital: ${other_marital_status_preference}`);
  if (this_marital_status !== other_marital_status_preference ||
      other_marital_status !== this_marital_status_preference) return false;
    console.log ('All preferences fields matched, returning TRUE....');
    return true; };
/*
   user_id,full_name, date_of_birth,gender, marital_status, self_intro,gender_preference, marital_status_preference, age_range,
 }
*/    