/**
 * Bangladesh Geographical Data
 * Complete administrative divisions for targeting and analytics
 */

export interface Area {
  name: string;
  type: 'city' | 'municipality' | 'village' | 'ward';
}

export interface Thana {
  name: string;
  areas?: Area[];
}

export interface District {
  name: string;
  thanas: Thana[];
}

export interface Division {
  name: string;
  districts: District[];
}

export const bangladeshLocations: Division[] = [
  {
    name: 'Dhaka',
    districts: [
      {
        name: 'Dhaka',
        thanas: [
          { name: 'Dhanmondi', areas: [{ name: 'Dhanmondi 2', type: 'ward' }, { name: 'Dhanmondi 8', type: 'ward' }, { name: 'Dhanmondi 15', type: 'ward' }] },
          { name: 'Gulshan', areas: [{ name: 'Gulshan 1', type: 'ward' }, { name: 'Gulshan 2', type: 'ward' }, { name: 'Banani', type: 'ward' }] },
          { name: 'Mirpur', areas: [{ name: 'Mirpur 1', type: 'ward' }, { name: 'Mirpur 10', type: 'ward' }, { name: 'Mirpur 11', type: 'ward' }, { name: 'Mirpur 12', type: 'ward' }] },
          { name: 'Mohammadpur', areas: [{ name: 'Mohammadpur Housing', type: 'ward' }, { name: 'Shyamoli', type: 'ward' }] },
          { name: 'Uttara', areas: [{ name: 'Uttara Sector 1', type: 'ward' }, { name: 'Uttara Sector 7', type: 'ward' }, { name: 'Uttara Sector 10', type: 'ward' }] },
          { name: 'Motijheel', areas: [{ name: 'Motijheel Commercial Area', type: 'ward' }, { name: 'Dilkusha', type: 'ward' }] },
          { name: 'Ramna', areas: [{ name: 'Ramna', type: 'ward' }, { name: 'Kawran Bazar', type: 'ward' }] },
          { name: 'Tejgaon', areas: [{ name: 'Tejgaon Industrial Area', type: 'ward' }, { name: 'Karwan Bazar', type: 'ward' }] },
          { name: 'Badda', areas: [{ name: 'Badda', type: 'ward' }, { name: 'Vatara', type: 'ward' }] },
          { name: 'Khilgaon', areas: [{ name: 'Khilgaon', type: 'ward' }, { name: 'Tilpapara', type: 'ward' }] },
          { name: 'Rampura', areas: [{ name: 'Rampura', type: 'ward' }, { name: 'Banasree', type: 'ward' }] },
          { name: 'Demra', areas: [{ name: 'Demra', type: 'ward' }, { name: 'Matuail', type: 'ward' }] },
          { name: 'Pallabi', areas: [{ name: 'Pallabi', type: 'ward' }, { name: 'Kafrul', type: 'ward' }] },
          { name: 'Cantonment', areas: [{ name: 'Cantonment', type: 'ward' }, { name: 'Baridhara', type: 'ward' }] },
          { name: 'Jatrabari', areas: [{ name: 'Jatrabari', type: 'ward' }, { name: 'Dholaipar', type: 'ward' }] },
          { name: 'Lalbagh', areas: [{ name: 'Lalbagh', type: 'ward' }, { name: 'Hazaribagh', type: 'ward' }] },
          { name: 'New Market', areas: [{ name: 'New Market', type: 'ward' }, { name: 'Azimpur', type: 'ward' }] },
          { name: 'Kotwali', areas: [{ name: 'Old Dhaka', type: 'ward' }, { name: 'Sadarghat', type: 'ward' }] },
          { name: 'Adabor', areas: [{ name: 'Adabor', type: 'ward' }, { name: 'Mohammadia Housing', type: 'ward' }] },
          { name: 'Shahbagh', areas: [{ name: 'Shahbagh', type: 'ward' }, { name: 'Karwan Bazar', type: 'ward' }] },
        ],
      },
      {
        name: 'Gazipur',
        thanas: [
          { name: 'Gazipur Sadar', areas: [{ name: 'Tongi', type: 'city' }, { name: 'Joydebpur', type: 'city' }] },
          { name: 'Kaliakair', areas: [{ name: 'Kaliakair', type: 'municipality' }] },
          { name: 'Kapasia', areas: [{ name: 'Kapasia', type: 'municipality' }] },
          { name: 'Sreepur', areas: [{ name: 'Sreepur', type: 'municipality' }] },
          { name: 'Kaliganj', areas: [{ name: 'Kaliganj', type: 'municipality' }] },
        ],
      },
      {
        name: 'Narayanganj',
        thanas: [
          { name: 'Narayanganj Sadar', areas: [{ name: 'Narayanganj City', type: 'city' }] },
          { name: 'Rupganj', areas: [{ name: 'Rupganj', type: 'municipality' }] },
          { name: 'Sonargaon', areas: [{ name: 'Sonargaon', type: 'municipality' }] },
          { name: 'Bandar', areas: [{ name: 'Bandar', type: 'municipality' }] },
          { name: 'Araihazar', areas: [{ name: 'Araihazar', type: 'municipality' }] },
        ],
      },
      {
        name: 'Tangail',
        thanas: [
          { name: 'Tangail Sadar', areas: [{ name: 'Tangail City', type: 'city' }] },
          { name: 'Madhupur', areas: [{ name: 'Madhupur', type: 'municipality' }] },
          { name: 'Mirzapur', areas: [{ name: 'Mirzapur', type: 'municipality' }] },
          { name: 'Basail', areas: [{ name: 'Basail', type: 'municipality' }] },
          { name: 'Kalihati', areas: [{ name: 'Kalihati', type: 'municipality' }] },
        ],
      },
      {
        name: 'Munshiganj',
        thanas: [
          { name: 'Munshiganj Sadar', areas: [{ name: 'Munshiganj Town', type: 'city' }] },
          { name: 'Sreenagar', areas: [{ name: 'Sreenagar', type: 'municipality' }] },
          { name: 'Gazaria', areas: [{ name: 'Gazaria', type: 'municipality' }] },
        ],
      },
      {
        name: 'Manikganj',
        thanas: [
          { name: 'Manikganj Sadar', areas: [{ name: 'Manikganj Town', type: 'city' }] },
          { name: 'Singair', areas: [{ name: 'Singair', type: 'municipality' }] },
          { name: 'Saturia', areas: [{ name: 'Saturia', type: 'municipality' }] },
        ],
      },
      {
        name: 'Faridpur',
        thanas: [
          { name: 'Faridpur Sadar', areas: [{ name: 'Faridpur City', type: 'city' }] },
          { name: 'Boalmari', areas: [{ name: 'Boalmari', type: 'municipality' }] },
          { name: 'Bhanga', areas: [{ name: 'Bhanga', type: 'municipality' }] },
        ],
      },
      {
        name: 'Rajbari',
        thanas: [
          { name: 'Rajbari Sadar', areas: [{ name: 'Rajbari Town', type: 'city' }] },
          { name: 'Goalanda', areas: [{ name: 'Goalanda', type: 'municipality' }] },
        ],
      },
      {
        name: 'Gopalganj',
        thanas: [
          { name: 'Gopalganj Sadar', areas: [{ name: 'Gopalganj Town', type: 'city' }] },
          { name: 'Tungipara', areas: [{ name: 'Tungipara', type: 'municipality' }] },
        ],
      },
      {
        name: 'Madaripur',
        thanas: [
          { name: 'Madaripur Sadar', areas: [{ name: 'Madaripur Town', type: 'city' }] },
          { name: 'Shibchar', areas: [{ name: 'Shibchar', type: 'municipality' }] },
        ],
      },
      {
        name: 'Shariatpur',
        thanas: [
          { name: 'Shariatpur Sadar', areas: [{ name: 'Shariatpur Town', type: 'city' }] },
          { name: 'Naria', areas: [{ name: 'Naria', type: 'municipality' }] },
        ],
      },
      {
        name: 'Kishoreganj',
        thanas: [
          { name: 'Kishoreganj Sadar', areas: [{ name: 'Kishoreganj City', type: 'city' }] },
          { name: 'Bhairab', areas: [{ name: 'Bhairab', type: 'municipality' }] },
          { name: 'Bajitpur', areas: [{ name: 'Bajitpur', type: 'municipality' }] },
        ],
      },
      {
        name: 'Narsingdi',
        thanas: [
          { name: 'Narsingdi Sadar', areas: [{ name: 'Narsingdi Town', type: 'city' }] },
          { name: 'Madhabdi', areas: [{ name: 'Madhabdi', type: 'municipality' }] },
        ],
      },
    ],
  },
  {
    name: 'Chittagong',
    districts: [
      {
        name: 'Chittagong',
        thanas: [
          { name: 'Kotwali', areas: [{ name: 'Sadarghat', type: 'ward' }, { name: 'Khatunganj', type: 'ward' }] },
          { name: 'Panchlaish', areas: [{ name: 'Panchlaish', type: 'ward' }, { name: 'Khulshi', type: 'ward' }] },
          { name: 'Halishahar', areas: [{ name: 'Halishahar', type: 'ward' }, { name: 'Port Area', type: 'ward' }] },
          { name: 'Agrabad', areas: [{ name: 'Agrabad Commercial Area', type: 'ward' }, { name: 'Nasirabad', type: 'ward' }] },
          { name: 'Double Mooring', areas: [{ name: 'Double Mooring', type: 'ward' }, { name: 'Chawk Bazar', type: 'ward' }] },
          { name: 'Pahartali', areas: [{ name: 'Pahartali', type: 'ward' }, { name: 'East Nasirabad', type: 'ward' }] },
          { name: 'Bayazid Bostami', areas: [{ name: 'Bayazid', type: 'ward' }, { name: 'Sholoshahar', type: 'ward' }] },
          { name: 'Chandgaon', areas: [{ name: 'Chandgaon', type: 'ward' }, { name: 'Muradpur', type: 'ward' }] },
          { name: 'Bakalia', areas: [{ name: 'Bakalia', type: 'ward' }] },
          { name: 'EPZ', areas: [{ name: 'EPZ Area', type: 'ward' }] },
        ],
      },
      {
        name: "Cox's Bazar",
        thanas: [
          { name: "Cox's Bazar Sadar", areas: [{ name: "Cox's Bazar Town", type: 'city' }] },
          { name: 'Ramu', areas: [{ name: 'Ramu', type: 'municipality' }] },
          { name: 'Ukhiya', areas: [{ name: 'Ukhiya', type: 'municipality' }] },
          { name: 'Teknaf', areas: [{ name: 'Teknaf', type: 'municipality' }] },
        ],
      },
      {
        name: 'Comilla',
        thanas: [
          { name: 'Comilla Sadar', areas: [{ name: 'Comilla City', type: 'city' }, { name: 'Kandirpar', type: 'ward' }] },
          { name: 'Daudkandi', areas: [{ name: 'Daudkandi', type: 'municipality' }] },
          { name: 'Laksam', areas: [{ name: 'Laksam', type: 'municipality' }] },
        ],
      },
      {
        name: 'Feni',
        thanas: [
          { name: 'Feni Sadar', areas: [{ name: 'Feni Town', type: 'city' }] },
          { name: 'Chhagalnaiya', areas: [{ name: 'Chhagalnaiya', type: 'municipality' }] },
        ],
      },
      {
        name: 'Noakhali',
        thanas: [
          { name: 'Noakhali Sadar', areas: [{ name: 'Maijdee', type: 'city' }] },
          { name: 'Begumganj', areas: [{ name: 'Begumganj', type: 'municipality' }] },
        ],
      },
      {
        name: 'Brahmanbaria',
        thanas: [
          { name: 'Brahmanbaria Sadar', areas: [{ name: 'Brahmanbaria Town', type: 'city' }] },
          { name: 'Kasba', areas: [{ name: 'Kasba', type: 'municipality' }] },
        ],
      },
      {
        name: 'Lakshmipur',
        thanas: [
          { name: 'Lakshmipur Sadar', areas: [{ name: 'Lakshmipur Town', type: 'city' }] },
          { name: 'Ramganj', areas: [{ name: 'Ramganj', type: 'municipality' }] },
        ],
      },
      {
        name: 'Chandpur',
        thanas: [
          { name: 'Chandpur Sadar', areas: [{ name: 'Chandpur Town', type: 'city' }] },
          { name: 'Hajiganj', areas: [{ name: 'Hajiganj', type: 'municipality' }] },
        ],
      },
      {
        name: 'Rangamati',
        thanas: [
          { name: 'Rangamati Sadar', areas: [{ name: 'Rangamati Town', type: 'city' }] },
          { name: 'Kaptai', areas: [{ name: 'Kaptai', type: 'municipality' }] },
        ],
      },
      {
        name: 'Bandarban',
        thanas: [
          { name: 'Bandarban Sadar', areas: [{ name: 'Bandarban Town', type: 'city' }] },
          { name: 'Thanchi', areas: [{ name: 'Thanchi', type: 'municipality' }] },
        ],
      },
      {
        name: 'Khagrachari',
        thanas: [
          { name: 'Khagrachari Sadar', areas: [{ name: 'Khagrachari Town', type: 'city' }] },
          { name: 'Dighinala', areas: [{ name: 'Dighinala', type: 'municipality' }] },
        ],
      },
    ],
  },
  {
    name: 'Rajshahi',
    districts: [
      {
        name: 'Rajshahi',
        thanas: [
          { name: 'Boalia', areas: [{ name: 'Shaheb Bazar', type: 'ward' }, { name: 'Rajpara', type: 'ward' }] },
          { name: 'Rajpara', areas: [{ name: 'Rajpara', type: 'ward' }] },
          { name: 'Motihar', areas: [{ name: 'Motihar', type: 'ward' }] },
          { name: 'Shah Makhdum', areas: [{ name: 'Kazla', type: 'ward' }] },
        ],
      },
      {
        name: 'Bogra',
        thanas: [
          { name: 'Bogra Sadar', areas: [{ name: 'Bogra City', type: 'city' }] },
          { name: 'Sherpur', areas: [{ name: 'Sherpur', type: 'municipality' }] },
        ],
      },
      {
        name: 'Pabna',
        thanas: [
          { name: 'Pabna Sadar', areas: [{ name: 'Pabna Town', type: 'city' }] },
          { name: 'Ishwardi', areas: [{ name: 'Ishwardi', type: 'municipality' }] },
        ],
      },
      {
        name: 'Natore',
        thanas: [
          { name: 'Natore Sadar', areas: [{ name: 'Natore Town', type: 'city' }] },
          { name: 'Baraigram', areas: [{ name: 'Baraigram', type: 'municipality' }] },
        ],
      },
      {
        name: 'Sirajganj',
        thanas: [
          { name: 'Sirajganj Sadar', areas: [{ name: 'Sirajganj Town', type: 'city' }] },
          { name: 'Belkuchi', areas: [{ name: 'Belkuchi', type: 'municipality' }] },
        ],
      },
      {
        name: 'Naogaon',
        thanas: [
          { name: 'Naogaon Sadar', areas: [{ name: 'Naogaon Town', type: 'city' }] },
          { name: 'Mohadevpur', areas: [{ name: 'Mohadevpur', type: 'municipality' }] },
        ],
      },
      {
        name: 'Chapainawabganj',
        thanas: [
          { name: 'Chapainawabganj Sadar', areas: [{ name: 'Chapainawabganj Town', type: 'city' }] },
          { name: 'Shibganj', areas: [{ name: 'Shibganj', type: 'municipality' }] },
        ],
      },
      {
        name: 'Joypurhat',
        thanas: [
          { name: 'Joypurhat Sadar', areas: [{ name: 'Joypurhat Town', type: 'city' }] },
        ],
      },
    ],
  },
  {
    name: 'Khulna',
    districts: [
      {
        name: 'Khulna',
        thanas: [
          { name: 'Khulna Sadar', areas: [{ name: 'Khulna City', type: 'city' }] },
          { name: 'Sonadanga', areas: [{ name: 'Sonadanga', type: 'ward' }] },
          { name: 'Khalishpur', areas: [{ name: 'Khalishpur', type: 'ward' }] },
          { name: 'Daulatpur', areas: [{ name: 'Daulatpur', type: 'ward' }] },
        ],
      },
      {
        name: 'Jessore',
        thanas: [
          { name: 'Jessore Sadar', areas: [{ name: 'Jessore City', type: 'city' }] },
          { name: 'Benapole', areas: [{ name: 'Benapole', type: 'municipality' }] },
        ],
      },
      {
        name: 'Satkhira',
        thanas: [
          { name: 'Satkhira Sadar', areas: [{ name: 'Satkhira Town', type: 'city' }] },
          { name: 'Kalaroa', areas: [{ name: 'Kalaroa', type: 'municipality' }] },
        ],
      },
      {
        name: 'Kushtia',
        thanas: [
          { name: 'Kushtia Sadar', areas: [{ name: 'Kushtia Town', type: 'city' }] },
          { name: 'Kumarkhali', areas: [{ name: 'Kumarkhali', type: 'municipality' }] },
        ],
      },
      {
        name: 'Bagerhat',
        thanas: [
          { name: 'Bagerhat Sadar', areas: [{ name: 'Bagerhat Town', type: 'city' }] },
          { name: 'Mongla', areas: [{ name: 'Mongla Port', type: 'municipality' }] },
        ],
      },
      {
        name: 'Chuadanga',
        thanas: [
          { name: 'Chuadanga Sadar', areas: [{ name: 'Chuadanga Town', type: 'city' }] },
        ],
      },
      {
        name: 'Jhenaidah',
        thanas: [
          { name: 'Jhenaidah Sadar', areas: [{ name: 'Jhenaidah Town', type: 'city' }] },
          { name: 'Kaliganj', areas: [{ name: 'Kaliganj', type: 'municipality' }] },
        ],
      },
      {
        name: 'Magura',
        thanas: [
          { name: 'Magura Sadar', areas: [{ name: 'Magura Town', type: 'city' }] },
        ],
      },
      {
        name: 'Meherpur',
        thanas: [
          { name: 'Meherpur Sadar', areas: [{ name: 'Meherpur Town', type: 'city' }] },
        ],
      },
      {
        name: 'Narail',
        thanas: [
          { name: 'Narail Sadar', areas: [{ name: 'Narail Town', type: 'city' }] },
        ],
      },
    ],
  },
  {
    name: 'Sylhet',
    districts: [
      {
        name: 'Sylhet',
        thanas: [
          { name: 'Sylhet Sadar', areas: [{ name: 'Zindabazar', type: 'ward' }, { name: 'Ambarkhana', type: 'ward' }] },
          { name: 'Jalalabad', areas: [{ name: 'Jalalabad', type: 'ward' }] },
          { name: 'Dakshin Surma', areas: [{ name: 'Dakshin Surma', type: 'municipality' }] },
        ],
      },
      {
        name: 'Moulvibazar',
        thanas: [
          { name: 'Moulvibazar Sadar', areas: [{ name: 'Moulvibazar Town', type: 'city' }] },
          { name: 'Sreemangal', areas: [{ name: 'Sreemangal', type: 'municipality' }] },
        ],
      },
      {
        name: 'Habiganj',
        thanas: [
          { name: 'Habiganj Sadar', areas: [{ name: 'Habiganj Town', type: 'city' }] },
          { name: 'Madhabpur', areas: [{ name: 'Madhabpur', type: 'municipality' }] },
        ],
      },
      {
        name: 'Sunamganj',
        thanas: [
          { name: 'Sunamganj Sadar', areas: [{ name: 'Sunamganj Town', type: 'city' }] },
          { name: 'Chhatak', areas: [{ name: 'Chhatak', type: 'municipality' }] },
        ],
      },
    ],
  },
  {
    name: 'Barisal',
    districts: [
      {
        name: 'Barisal',
        thanas: [
          { name: 'Barisal Sadar', areas: [{ name: 'Barisal City', type: 'city' }] },
          { name: 'Kotwali', areas: [{ name: 'Kotwali', type: 'ward' }] },
          { name: 'Bandar', areas: [{ name: 'Bandar', type: 'ward' }] },
        ],
      },
      {
        name: 'Patuakhali',
        thanas: [
          { name: 'Patuakhali Sadar', areas: [{ name: 'Patuakhali Town', type: 'city' }] },
          { name: 'Kuakata', areas: [{ name: 'Kuakata Beach', type: 'municipality' }] },
        ],
      },
      {
        name: 'Bhola',
        thanas: [
          { name: 'Bhola Sadar', areas: [{ name: 'Bhola Town', type: 'city' }] },
        ],
      },
      {
        name: 'Barguna',
        thanas: [
          { name: 'Barguna Sadar', areas: [{ name: 'Barguna Town', type: 'city' }] },
        ],
      },
      {
        name: 'Jhalokati',
        thanas: [
          { name: 'Jhalokati Sadar', areas: [{ name: 'Jhalokati Town', type: 'city' }] },
        ],
      },
      {
        name: 'Pirojpur',
        thanas: [
          { name: 'Pirojpur Sadar', areas: [{ name: 'Pirojpur Town', type: 'city' }] },
        ],
      },
    ],
  },
  {
    name: 'Rangpur',
    districts: [
      {
        name: 'Rangpur',
        thanas: [
          { name: 'Rangpur Sadar', areas: [{ name: 'Rangpur City', type: 'city' }] },
          { name: 'Tajhat', areas: [{ name: 'Tajhat', type: 'ward' }] },
        ],
      },
      {
        name: 'Dinajpur',
        thanas: [
          { name: 'Dinajpur Sadar', areas: [{ name: 'Dinajpur City', type: 'city' }] },
          { name: 'Parbatipur', areas: [{ name: 'Parbatipur', type: 'municipality' }] },
        ],
      },
      {
        name: 'Gaibandha',
        thanas: [
          { name: 'Gaibandha Sadar', areas: [{ name: 'Gaibandha Town', type: 'city' }] },
        ],
      },
      {
        name: 'Kurigram',
        thanas: [
          { name: 'Kurigram Sadar', areas: [{ name: 'Kurigram Town', type: 'city' }] },
        ],
      },
      {
        name: 'Lalmonirhat',
        thanas: [
          { name: 'Lalmonirhat Sadar', areas: [{ name: 'Lalmonirhat Town', type: 'city' }] },
        ],
      },
      {
        name: 'Nilphamari',
        thanas: [
          { name: 'Nilphamari Sadar', areas: [{ name: 'Nilphamari Town', type: 'city' }] },
        ],
      },
      {
        name: 'Panchagarh',
        thanas: [
          { name: 'Panchagarh Sadar', areas: [{ name: 'Panchagarh Town', type: 'city' }] },
        ],
      },
      {
        name: 'Thakurgaon',
        thanas: [
          { name: 'Thakurgaon Sadar', areas: [{ name: 'Thakurgaon Town', type: 'city' }] },
        ],
      },
    ],
  },
  {
    name: 'Mymensingh',
    districts: [
      {
        name: 'Mymensingh',
        thanas: [
          { name: 'Mymensingh Sadar', areas: [{ name: 'Mymensingh City', type: 'city' }] },
          { name: 'Kotwali', areas: [{ name: 'Kotwali', type: 'ward' }] },
        ],
      },
      {
        name: 'Jamalpur',
        thanas: [
          { name: 'Jamalpur Sadar', areas: [{ name: 'Jamalpur Town', type: 'city' }] },
        ],
      },
      {
        name: 'Netrokona',
        thanas: [
          { name: 'Netrokona Sadar', areas: [{ name: 'Netrokona Town', type: 'city' }] },
        ],
      },
      {
        name: 'Sherpur',
        thanas: [
          { name: 'Sherpur Sadar', areas: [{ name: 'Sherpur Town', type: 'city' }] },
        ],
      },
    ],
  },
];

// Helper functions
export function getAllDivisions(): string[] {
  return bangladeshLocations.map(d => d.name);
}

export function getDistrictsByDivision(divisionName: string): string[] {
  const division = bangladeshLocations.find(d => d.name === divisionName);
  return division ? division.districts.map(d => d.name) : [];
}

export function getThanasByDistrict(divisionName: string, districtName: string): string[] {
  const division = bangladeshLocations.find(d => d.name === divisionName);
  if (!division) return [];

  const district = division.districts.find(d => d.name === districtName);
  return district ? district.thanas.map(t => t.name) : [];
}

export function getAreasByThana(divisionName: string, districtName: string, thanaName: string): Area[] {
  const division = bangladeshLocations.find(d => d.name === divisionName);
  if (!division) return [];

  const district = division.districts.find(d => d.name === districtName);
  if (!district) return [];

  const thana = district.thanas.find(t => t.name === thanaName);
  return thana?.areas || [];
}

export function getAllDistricts(): string[] {
  const districts: string[] = [];
  bangladeshLocations.forEach(division => {
    division.districts.forEach(district => {
      districts.push(district.name);
    });
  });
  return districts;
}

export function getAllThanas(): string[] {
  const thanas: string[] = [];
  bangladeshLocations.forEach(division => {
    division.districts.forEach(district => {
      district.thanas.forEach(thana => {
        thanas.push(thana.name);
      });
    });
  });
  return thanas;
}
