package com.enspy.webtree.services;


import com.enspy.webtree.config.PasswordEncoderConfig;
import com.enspy.webtree.dto.requests.ConnectToFamilyDTO;
import com.enspy.webtree.dto.requests.CreateUserDto;
import com.enspy.webtree.dto.requests.LoginDTO;
import com.enspy.webtree.dto.responses.ApiResponse;
import com.enspy.webtree.models.Family;
import com.enspy.webtree.models.Users;
import com.enspy.webtree.repositories.FamilyRepository;
import com.enspy.webtree.repositories.UserRepository;
import com.enspy.webtree.utils.RandomStringGenerator;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthenticationService {

    public AuthenticationService(UserRepository userRepository,
                                 PasswordEncoder passwordEncoder,
                                 FamilyRepository familyRepository,
                                 JWTService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.familyRepository = familyRepository;
        this.jwtService = jwtService;
    }

    private UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    private FamilyRepository familyRepository;
    private JWTService jwtService;


    public String generateUsername(Users user){
        boolean exist = true;
        String username = null;
        while (exist) {
            try {
                username = RandomStringGenerator.generateRandomString(10);
                user.setUsername(username);
                userRepository.save(user);
                exist = false;
            } catch (DataIntegrityViolationException | ConstraintViolationException e) {
                exist = true;
            }
        }
        return username;

    }

    public ApiResponse createUser(CreateUserDto createUserDto){
        Users user = new Users();
        ApiResponse response = new ApiResponse();

        try {
            Optional<Users> userOpt  = userRepository.findByEmail(createUserDto.getEmail());
            if(userOpt.isPresent()){
                response.setText("email already used");
                response.setValue("409");
                return response;
            }
            user.setEmail(createUserDto.getEmail());
            user.setFirstName(createUserDto.getFirstName());
            user.setLastName(createUserDto.getLastName());
            user.setPassword(passwordEncoder.encode(createUserDto.getPassword()));
            user.setDateOfBirth(createUserDto.getDateOfBirth());
            if(createUserDto.getFamilyId() != null){
                Optional<Family> familyOtp = familyRepository.findById(createUserDto.getFamilyId());
                if(familyOtp.isEmpty()){
                    response.setText("La famille n'existe pas");
                    response.setValue("404");
                    return response;
                }
                user.addFamily(familyOtp.get());
            }
            String username = generateUsername(user);
            response.setText("User creates Sucessfully");
            response.setValue("200");
            response.setData(username);
            return response;

        } catch (Exception e) {
            response.setText("Error creating user" + e.getMessage());
            response.setValue("500");
            return response;
        }

    }


    public ApiResponse login(LoginDTO loginDTO){
        ApiResponse response = new ApiResponse();
        Optional<Users> userOpt = userRepository.findByEmail(loginDTO.getEmail());
        if(userOpt.isEmpty()){
            response.setText("email not found in database");
            response.setValue("404");
            response.setData(null);
            return response;
        }
        Users user = userOpt.get();
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            response.setValue("401");
            response.setText("invalid password");
            return response;
        }

        return generateToken(user);
    }

    private ApiResponse generateToken(Users user){
        ApiResponse apiError = new ApiResponse();
        Map<String, Object> map = new HashMap<>();
        map.put("Bearer Infos", jwtService.generate(user.getUsername()));

        apiError.setData(map);
        apiError.setText("User Login successfully.");
        apiError.setValue("200");
        return apiError;
    }

    private ApiResponse generateFamilyToken(Family family){
        ApiResponse apiError = new ApiResponse();
        Map<String, Object> map = new HashMap<>();
        map.put("Bearer Infos", jwtService.generateFamilyToken(family));

        apiError.setData(map);
        apiError.setText("User Login successfully.");
        apiError.setValue("200");
        return apiError;
    }

    public ApiResponse connectToFamily(ConnectToFamilyDTO connect){
        ApiResponse response = new ApiResponse();
        Optional<Family> familyOpt = familyRepository.findById(connect.getFamilyId());
        if (familyOpt.isEmpty()){
            response.setText("invalid family id");
            response.setValue("404");
            return response;
        }
        Family family = familyOpt.get();

        Optional<Users> userOpt = userRepository.findByUsername(connect.getUsername());
        if(userOpt.isEmpty()){
            response.setText("invalid username");
            response.setValue("404");
            return response;
        }

        Users user = userOpt.get();
        if(!(user.getFamilies().contains(family))){
            response.setText("user is not member of this family");
            response.setValue("401");
            return response;
        }

        return generateFamilyToken(family);
    }

}
